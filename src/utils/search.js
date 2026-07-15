// src/utils/search.js

/*
 * 검색에서 제외할 일반적인 표현
 */
const STOP_WORDS = new Set([
  '추천',
  '추천해줘',
  '추천해주세요',
  '알려줘',
  '알려주세요',
  '찾아줘',
  '찾아주세요',
  '있는',
  '할',
  '수',
  '곳',
  '장소',
  '서울',
  '서울에서',
])

/*
 * 사용자 문장을 검색 키워드 배열로 변환한다.
 *
 * 예:
 * "광진구 놀거리 추천해줘"
 * → ["광진구", "놀거리"]
 */
export function extractSearchKeywords(keyword) {
  if (!keyword) {
    return []
  }

  return String(keyword)
    .toLowerCase()
    .replace(/[?!,.~]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => !STOP_WORDS.has(word))
    .filter((word) => word.length >= 2)
}

/*
 * 데이터 한 건에서 검색 가능한 문자열을 만든다.
 *
 * 서울 JSON과 localStorage 게시글 모두 검색할 수 있도록
 * 여러 필드를 합친다.
 */
function createSearchText(item) {
  return [
    item.searchText,
    item.title,
    item.address,
    item.addr1,
    item.addr2,
    item.category,
    item.categoryName,
    item.content,
    item.body,
    item.nickname,
    item.author,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/*
 * 키워드 기반 검색
 */
export function searchItems(
  items,
  keyword,
  limit = 5,
) {
  if (!Array.isArray(items)) {
    return []
  }

  const keywords =
    extractSearchKeywords(keyword)

  if (keywords.length === 0) {
    return []
  }

  const scoredItems = items
    .map((item) => {
      const searchText =
        createSearchText(item)

      const title = String(
        item.title || '',
      ).toLowerCase()

      const address = String(
        item.address || item.addr1 || '',
      ).toLowerCase()

      const category = String(
        item.category || '',
      ).toLowerCase()

      let score = 0
      let matchedKeywordCount = 0

      keywords.forEach((searchKeyword) => {
        let matched = false

        if (title.includes(searchKeyword)) {
          score += 10
          matched = true
        }

        if (address.includes(searchKeyword)) {
          score += 8
          matched = true
        }

        if (category.includes(searchKeyword)) {
          score += 6
          matched = true
        }

        if (
          searchText.includes(searchKeyword)
        ) {
          score += 3
          matched = true
        }

        if (matched) {
          matchedKeywordCount += 1
        }
      })

      /*
       * 키워드가 하나도 일치하지 않으면 제외
       */
      if (matchedKeywordCount === 0) {
        return null
      }

      /*
       * 여러 키워드가 동시에 일치하면 우선순위 상승
       */
      if (
        matchedKeywordCount ===
        keywords.length
      ) {
        score += 10
      }

      return {
        item,
        score,
        matchedKeywordCount,
      }
    })
    .filter(Boolean)

  scoredItems.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }

    return (
      b.matchedKeywordCount -
      a.matchedKeywordCount
    )
  })

  return scoredItems
    .slice(0, limit)
    .map((result) => result.item)
}