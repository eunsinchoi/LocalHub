// src/services/chatbotService.js

const CHATBOT_API_URL = '/api/openai'

const SYSTEM_PROMPT = `
당신은 서울 지역 정보 공유 커뮤니티 LocalHub의 AI 안내 도우미입니다.

사용자의 질문과 함께 다음 두 종류의 정보가 제공됩니다.

1. 한국관광공사 TourAPI 기반 서울 지역 JSON 검색 결과
2. LocalHub에 저장된 커뮤니티 게시글 검색 결과

두 정보를 종합하여 하나의 자연스러운 답변을 작성하세요.

규칙:
1. 제공된 검색 결과에 없는 장소나 게시글을 만들어내지 마세요.
2. 서울 지역 JSON 결과를 주요 근거로 사용하세요.
3. 관련 커뮤니티 게시글이 있으면 후기나 참고 정보로 함께 소개하세요.
4. 커뮤니티 게시글이 없으면 없다는 사실을 굳이 길게 강조하지 마세요.
5. 질문 의도와 맞지 않는 장소는 추천하지 마세요.
6. 최대 5개까지만 추천하세요.
7. 장소명, 카테고리, 주소를 정확하게 표시하세요.
8. 게시글을 소개할 때 제목과 카테고리를 함께 표시하세요.
9. JSON 결과와 게시글을 따로 나열하지 말고 하나의 통합 답변으로 작성하세요.
10. 답변은 친절하고 간결한 한국어로 작성하세요.
11. 마지막에 데이터 출처가 한국관광공사 TourAPI 4.0임을 짧게 표시하세요.
`.trim()

function normalizeText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return ''
  }

  return String(value).trim()
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(
      resolve,
      milliseconds,
    )
  })
}

function createLocalResultItem(item) {
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
  }
}

function createPostResultItem(post) {
  return {
    id:
      normalizeText(post.id),

    category:
      normalizeText(post.category),

    title:
      normalizeText(post.title),

    content:
      normalizeText(post.content)
        .slice(0, 300),

    author:
      normalizeText(
        post.nickname ||
        post.author,
      ),

    createdAt:
      normalizeText(
        post.createdAt ||
        post.date,
      ),
  }
}

function createLocalContext(results = []) {
  if (!Array.isArray(results)) {
    return []
  }

  return results
    .filter((item) => item?.title)
    .slice(0, 5)
    .map(createLocalResultItem)
}

function createPostContext(posts = []) {
  if (!Array.isArray(posts)) {
    return []
  }

  return posts
    .filter((post) => post?.title)
    .slice(0, 5)
    .map(createPostResultItem)
}

function createUserPrompt(
  userMessage,
  localResults,
  postResults,
) {
  const normalizedMessage =
    normalizeText(userMessage)

  const localContext =
    createLocalContext(localResults)

  const postContext =
    createPostContext(postResults)

  return `
사용자 질문:
${normalizedMessage}

서울 지역 JSON 검색 결과:
${JSON.stringify(localContext, null, 2)}

LocalHub 커뮤니티 게시글 검색 결과:
${JSON.stringify(postContext, null, 2)}

두 검색 결과를 종합하여 하나의 답변을 작성하세요.

추가 지침:
- JSON 검색 결과가 있으면 적합한 장소를 우선 추천하세요.
- 관련 게시글이 있으면 추천 장소 설명 뒤에 참고 후기처럼 자연스럽게 연결하세요.
- 관련 게시글이 없으면 장소 추천만 자연스럽게 제공하세요.
- JSON 검색 결과가 없지만 게시글이 있으면 게시글을 바탕으로 안내하세요.
- 두 검색 결과가 모두 없으면 관련 정보를 찾지 못했다고 안내하세요.
`.trim()
}

function extractResponseText(data) {
  if (
    typeof data?.output_text === 'string' &&
    data.output_text.trim()
  ) {
    return data.output_text.trim()
  }

  if (!Array.isArray(data?.output)) {
    return ''
  }

  const texts = []

  data.output.forEach((outputItem) => {
    if (
      !Array.isArray(
        outputItem?.content,
      )
    ) {
      return
    }

    outputItem.content.forEach(
      (contentItem) => {
        if (
          typeof contentItem?.text ===
            'string' &&
          contentItem.text.trim()
        ) {
          texts.push(
            contentItem.text.trim(),
          )
        }
      },
    )
  })

  return texts.join('\n')
}

function canRetryRequest(status) {
  return (
    status === 429 ||
    status >= 500
  )
}

function createFriendlyApiError(
  status,
  requestId,
) {
  let message =
    'AI 답변 생성 중 오류가 발생했습니다.'

  if (status === 401) {
    message =
      'OpenAI API 키가 올바르지 않습니다.'
  } else if (status === 403) {
    message =
      '현재 API 프로젝트에서 해당 모델을 사용할 수 없습니다.'
  } else if (status === 429) {
    message =
      'AI 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.'
  } else if (status >= 500) {
    message =
      'AI 서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }

  const error = new Error(message)

  error.status = status
  error.requestId = requestId

  return error
}

async function callOpenAi(
  requestBody,
  retryCount = 1,
) {
  let lastError = null

  for (
    let attempt = 0;
    attempt <= retryCount;
    attempt += 1
  ) {
    try {
      const response = await fetch(
        CHATBOT_API_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            requestBody,
          ),
        },
      )

      const requestId =
        response.headers.get(
          'x-request-id',
        ) || ''

      const responseData =
        await response
          .json()
          .catch(() => ({}))

      if (response.ok) {
        return {
          data: responseData,
          requestId,
        }
      }

      console.error(
        'OpenAI API 응답 오류',
        {
          status: response.status,
          requestId,
          responseData,
          attempt,
        },
      )

      const apiError =
        createFriendlyApiError(
          response.status,
          requestId,
        )

      lastError = apiError

      if (
        canRetryRequest(
          response.status,
        ) &&
        attempt < retryCount
      ) {
        await wait(
          1000 * (attempt + 1),
        )

        continue
      }

      throw apiError
    } catch (error) {
      lastError = error

      const isNetworkError =
        !error?.status

      if (
        isNetworkError &&
        attempt < retryCount
      ) {
        await wait(
          1000 * (attempt + 1),
        )

        continue
      }

      if (error?.status) {
        throw error
      }

      throw new Error(
        'AI 서버에 연결하지 못했습니다. 인터넷 연결 상태를 확인해 주세요.',
      )
    }
  }

  throw (
    lastError ||
    new Error(
      'AI 답변 생성 중 오류가 발생했습니다.',
    )
  )
}

export function hasOpenAiApiKey() {
  return true
}

export async function requestChatbotAnswer(
  userMessage,
  localResults = [],
  postResults = [],
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
      'OpenAI API 키가 설정되지 않았습니다.',
    )
  }

  const userPrompt =
    createUserPrompt(
      normalizedMessage,
      localResults,
      postResults,
    )

  const {
    data,
    requestId,
  } = await callOpenAi(
    {
      input: userPrompt,
    },
    1,
  )

  const answer =
    extractResponseText(data)

  if (!answer) {
    console.error(
      'OpenAI 응답 텍스트 없음',
      {
        requestId,
        data,
      },
    )

    throw new Error(
      'AI가 답변을 생성하지 못했습니다.',
    )
  }

  return answer
}