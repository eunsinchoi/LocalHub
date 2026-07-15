// src/services/chatbotService.js

/*
 * LocalHub 챗봇 API 서비스
 *
 * 역할
 * 1. 사용자 질문과 서울 지역 검색 결과를 전달받는다.
 * 2. OpenAI에 전달할 프롬프트를 만든다.
 * 3. OpenAI API를 호출한다.
 * 4. 생성된 답변 문자열을 반환한다.
 */

const OPENAI_API_URL =
  'https://api.openai.com/v1/responses'

const OPENAI_API_KEY =
  import.meta.env.VITE_OPENAI_API_KEY

/*
 * 사용할 OpenAI 모델
 *
 * 필요하면 .env에서 모델명을 바꿀 수 있다.
 *
 * .env 예:
 * VITE_OPENAI_MODEL=gpt-4.1-mini
 */
const OPENAI_MODEL =
  import.meta.env.VITE_OPENAI_MODEL ||
  'gpt-4.1-mini'

/*
 * OpenAI에 전달할 기본 시스템 프롬프트
 */
const SYSTEM_PROMPT = `
당신은 서울 지역 정보 공유 커뮤니티 LocalHub의 안내 챗봇입니다.

사용자가 서울의 관광지, 레포츠, 문화시설, 쇼핑, 여행코스,
축제공연에 대해 질문하면 제공된 검색 결과를 바탕으로 답변하세요.

반드시 다음 규칙을 지키세요.

1. 제공된 지역 검색 결과에 있는 정보만 사용하세요.
2. 검색 결과에 없는 장소나 정보를 임의로 만들어내지 마세요.
3. 장소를 소개할 때 장소명, 카테고리, 주소를 정확하게 표시하세요.
4. 추천 장소는 최대 5개까지만 안내하세요.
5. 주소나 전화번호가 없는 경우 없는 정보를 추측하지 마세요.
6. 사용자의 질문과 관련된 결과가 없으면 찾지 못했다고 솔직하게 안내하세요.
7. 결과가 없을 때는 지역명이나 카테고리를 바꿔 질문하도록 안내하세요.
8. 답변은 친절하고 이해하기 쉬운 한국어로 작성하세요.
9. 너무 긴 설명보다는 핵심 정보를 먼저 전달하세요.
10. 데이터 출처는 한국관광공사 TourAPI 4.0입니다.
`.trim()

/*
 * 문자열 값을 안전하게 정리한다.
 */
function normalizeText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return ''
  }

  return String(value).trim()
}

/*
 * 검색 결과 한 건에서
 * 챗봇 답변에 필요한 필드만 추출한다.
 *
 * raw 전체 데이터를 API에 보내지 않기 때문에
 * 토큰 사용량을 줄일 수 있다.
 */
function createSearchResultItem(item) {
  return {
    id:
      normalizeText(item.id) ||
      normalizeText(item.contentId),

    category:
      normalizeText(item.category),

    title:
      normalizeText(item.title),

    address:
      normalizeText(item.address),

    telephone:
      normalizeText(item.telephone),

    image:
      normalizeText(item.image),
  }
}

/*
 * 검색 결과 배열을 API 전달용으로 정리한다.
 *
 * 최대 5개까지만 전달한다.
 */
function createSearchContext(
  searchResults = [],
) {
  if (!Array.isArray(searchResults)) {
    return []
  }

  return searchResults
    .filter((item) => item?.title)
    .slice(0, 5)
    .map(createSearchResultItem)
}

/*
 * OpenAI에 전달할 사용자 메시지를 생성한다.
 */
function createUserPrompt(
  userMessage,
  searchResults,
) {
  const normalizedMessage =
    normalizeText(userMessage)

  const searchContext =
    createSearchContext(searchResults)

  if (searchContext.length === 0) {
    return `
사용자 질문:
${normalizedMessage}

서울 지역 JSON 검색 결과:
검색 결과 없음

검색 결과가 없으므로 장소를 임의로 만들어내지 말고,
제공된 데이터에서 찾지 못했다고 안내하세요.
사용자가 다른 지역명이나 카테고리로 다시 질문할 수 있도록
간단한 질문 예시를 함께 제안하세요.
`.trim()
  }

  return `
사용자 질문:
${normalizedMessage}

서울 지역 JSON 검색 결과:
${JSON.stringify(searchContext, null, 2)}

위 검색 결과만 활용하여 사용자의 질문에 답변하세요.
관련도가 높은 장소부터 최대 5개까지 안내하세요.
`.trim()
}

/*
 * OpenAI Responses API 응답에서
 * 최종 텍스트를 추출한다.
 */
function extractResponseText(data) {
  /*
   * Responses API가 제공하는
   * output_text 값이 있으면 우선 사용한다.
   */
  if (
    typeof data?.output_text === 'string' &&
    data.output_text.trim()
  ) {
    return data.output_text.trim()
  }

  /*
   * output_text가 없는 응답을 대비하여
   * output 배열을 직접 확인한다.
   */
  if (!Array.isArray(data?.output)) {
    return ''
  }

  const textList = []

  data.output.forEach((outputItem) => {
    if (!Array.isArray(outputItem?.content)) {
      return
    }

    outputItem.content.forEach(
      (contentItem) => {
        if (
          typeof contentItem?.text ===
            'string' &&
          contentItem.text.trim()
        ) {
          textList.push(
            contentItem.text.trim(),
          )
        }
      },
    )
  })

  return textList.join('\n')
}

/*
 * OpenAI API 오류 응답에서
 * 사용자에게 보여줄 메시지를 추출한다.
 */
function getApiErrorMessage(data) {
  const apiMessage =
    normalizeText(data?.error?.message)

  if (apiMessage) {
    return apiMessage
  }

  return 'OpenAI API 요청 중 오류가 발생했습니다.'
}

/*
 * API 키가 설정되어 있는지 확인한다.
 */
export function hasOpenAiApiKey() {
  return Boolean(
    normalizeText(OPENAI_API_KEY),
  )
}

/*
 * LocalHub 챗봇에 답변을 요청한다.
 *
 * 사용 예:
 *
 * const answer =
 *   await requestChatbotAnswer(
 *     '종로구 관광지를 추천해줘',
 *     searchResults,
 *   )
 */
export async function requestChatbotAnswer(
  userMessage,
  searchResults = [],
) {
  const normalizedMessage =
    normalizeText(userMessage)

  if (!normalizedMessage) {
    throw new Error(
      '질문 내용을 입력해 주세요.',
    )
  }

  if (!hasOpenAiApiKey()) {
    throw new Error(
      'OpenAI API 키가 설정되지 않았습니다. .env 파일의 VITE_OPENAI_API_KEY를 확인해 주세요.',
    )
  }

  const userPrompt = createUserPrompt(
    normalizedMessage,
    searchResults,
  )

  let response

  try {
    response = await fetch(
      OPENAI_API_URL,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${OPENAI_API_KEY}`,
        },

        body: JSON.stringify({
          model: OPENAI_MODEL,

          instructions:
            SYSTEM_PROMPT,

          input: userPrompt,

          temperature: 0.3,

          max_output_tokens: 700,
        }),
      },
    )
  } catch (error) {
    console.error(
      'OpenAI API 네트워크 오류:',
      error,
    )

    throw new Error(
      '챗봇 서버에 연결하지 못했습니다. 인터넷 연결 상태를 확인해 주세요.',
    )
  }

  let responseData

  try {
    responseData =
      await response.json()
  } catch {
    throw new Error(
      '챗봇 응답을 읽지 못했습니다.',
    )
  }

  if (!response.ok) {
    console.error(
      'OpenAI API 오류:',
      responseData,
    )

    throw new Error(
      getApiErrorMessage(responseData),
    )
  }

  const answer =
    extractResponseText(responseData)

  if (!answer) {
    throw new Error(
      '챗봇이 답변을 생성하지 못했습니다.',
    )
  }

  return answer
}

/*
 * 검색 결과 없이 일반 대화를 요청할 때 사용한다.
 *
 * 단, 지역 정보 질문은 가능하면
 * requestChatbotAnswer에 검색 결과를 전달하는 것이 좋다.
 */
export async function requestGeneralChatAnswer(
  userMessage,
) {
  return requestChatbotAnswer(
    userMessage,
    [],
  )
}