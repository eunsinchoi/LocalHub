// src/services/localDataService.js

/*
 * 서울 지역 JSON 데이터 전담 서비스
 *
 * 역할
 * 1. public/data 폴더의 JSON 파일을 불러온다.
 * 2. TourAPI 원본 데이터를 화면에서 사용하기 쉬운 구조로 변환한다.
 * 3. 카테고리별 데이터와 전체 데이터를 제공한다.
 * 4. 같은 JSON을 반복 요청하지 않도록 메모리에 저장한다.
 */

/*
 * 앱 내부에서 사용할 카테고리 정보
 *
 * key:
 * Vue Router, 검색, 챗봇 등에서 사용하는 내부 이름
 *
 * name:
 * 화면에 표시할 한글 카테고리명
 *
 * file:
 * public/data 폴더에 저장된 실제 JSON 파일명
 */
export const CATEGORY_CONFIG = {
  tourist: {
    name: '관광지',
    file: '/data/서울_관광지.json',
    contentTypeId: '12',
  },

  culture: {
    name: '문화시설',
    file: '/data/서울_문화시설.json',
    contentTypeId: '14',
  },

  festival: {
    name: '축제공연',
    file: '/data/서울_축제공연행사.json',
    contentTypeId: '15',
  },

  course: {
    name: '여행코스',
    file: '/data/서울_여행코스.json',
    contentTypeId: '25',
  },

  leports: {
    name: '레포츠',
    file: '/data/서울_레포츠.json',
    contentTypeId: '28',
  },

  shopping: {
    name: '쇼핑',
    file: '/data/서울_쇼핑.json',
    contentTypeId: '38',
  },
}

/*
 * 한 번 불러온 데이터를 저장하는 공간
 *
 * 예:
 * categoryCache.tourist = 관광지 배열
 *
 * 같은 페이지에서 데이터를 여러 번 요청해도
 * JSON 파일을 다시 fetch하지 않도록 한다.
 */
const categoryCache = {}

/*
 * 전체 카테고리를 합친 데이터를 저장한다.
 *
 * null:
 * 아직 전체 데이터를 불러오지 않은 상태
 */
let allDataCache = null

/*
 * 빈 문자열, null, undefined를 안전하게 처리하는 함수
 */
function normalizeText(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

/*
 * 문자열로 저장된 좌표를 숫자로 변환한다.
 *
 * 변환할 수 없는 값이면 null을 반환한다.
 */
function normalizeCoordinate(value) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return null
  }

  const numberValue = Number(normalizedValue)

  return Number.isFinite(numberValue)
    ? numberValue
    : null
}

/*
 * TourAPI 날짜 문자열을 일반적인 날짜 형식으로 변환한다.
 *
 * 입력 예:
 * 20260714143000
 *
 * 반환 예:
 * 2026-07-14 14:30
 */
function normalizeTourApiDate(value) {
  const dateText = normalizeText(value)

  if (dateText.length < 8) {
    return ''
  }

  const year = dateText.slice(0, 4)
  const month = dateText.slice(4, 6)
  const day = dateText.slice(6, 8)

  if (dateText.length < 12) {
    return `${year}-${month}-${day}`
  }

  const hour = dateText.slice(8, 10)
  const minute = dateText.slice(10, 12)

  return `${year}-${month}-${day} ${hour}:${minute}`
}

/*
 * addr1과 addr2를 합쳐 하나의 주소로 만든다.
 */
function createAddress(addr1, addr2) {
  return [
    normalizeText(addr1),
    normalizeText(addr2),
  ]
    .filter(Boolean)
    .join(' ')
}

/*
 * 원본 TourAPI 데이터 한 건을
 * LocalHub에서 사용하는 공통 구조로 변환한다.
 */
function normalizeItem(item, categoryKey, categoryName) {
  const image = normalizeText(item.firstimage)
  const thumbnail = normalizeText(item.firstimage2)

  return {
    /*
     * 주요 식별 정보
     */
    id: normalizeText(item.contentid),
    contentId: normalizeText(item.contentid),
    contentTypeId: normalizeText(item.contenttypeid),

    /*
     * 카테고리 정보
     */
    categoryKey,
    category: categoryName,

    /*
     * 장소 기본 정보
     */
    title: normalizeText(item.title),
    address: createAddress(
      item.addr1,
      item.addr2,
    ),
    addr1: normalizeText(item.addr1),
    addr2: normalizeText(item.addr2),
    zipcode: normalizeText(item.zipcode),
    telephone: normalizeText(item.tel),

    /*
     * 이미지
     *
     * image:
     * 원본 이미지가 없으면 썸네일을 대신 사용한다.
     */
    image: image || thumbnail,
    originalImage: image,
    thumbnail,

    /*
     * 지도 좌표
     */
    longitude: normalizeCoordinate(item.mapx),
    latitude: normalizeCoordinate(item.mapy),
    mapLevel: normalizeText(item.mlevel),

    /*
     * 지역 및 분류 코드
     */
    areaCode: normalizeText(item.areacode),
    sigunguCode: normalizeText(item.sigungucode),

    categoryCode1: normalizeText(item.cat1),
    categoryCode2: normalizeText(item.cat2),
    categoryCode3: normalizeText(item.cat3),

    /*
     * 등록 및 수정일
     */
    createdAt: normalizeTourApiDate(
      item.createdtime,
    ),
    modifiedAt: normalizeTourApiDate(
      item.modifiedtime,
    ),

    /*
     * 검색할 때 사용할 통합 문자열
     *
     * 검색할 때 매번 title, address 등을 합치지 않아도 된다.
     */
    searchText: [
      item.title,
      item.addr1,
      item.addr2,
      item.tel,
      categoryName,
    ]
      .map(normalizeText)
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),

    /*
     * 필요할 경우 원본 데이터에 접근하기 위한 값
     */
    raw: item,
  }
}

/*
 * 카테고리 키가 올바른지 확인한다.
 */
export function isValidCategory(categoryKey) {
  return Boolean(
    CATEGORY_CONFIG[categoryKey],
  )
}

/*
 * 카테고리의 한글 이름을 반환한다.
 *
 * 예:
 * getCategoryName('tourist')
 * → '관광지'
 */
export function getCategoryName(categoryKey) {
  return (
    CATEGORY_CONFIG[categoryKey]?.name || ''
  )
}

/*
 * 모든 카테고리 설정을 배열로 반환한다.
 *
 * 헤더, 메인 바로가기 등의 메뉴를 만들 때 사용할 수 있다.
 */
export function getCategories() {
  return Object.entries(CATEGORY_CONFIG).map(
    ([key, config]) => ({
      key,
      name: config.name,
      file: config.file,
      contentTypeId: config.contentTypeId,
    }),
  )
}

/*
 * JSON 파일 하나를 불러오는 내부 함수
 */
async function fetchJsonFile(filePath) {
  const response = await fetch(filePath)

  if (!response.ok) {
    throw new Error(
      `데이터 파일을 불러오지 못했습니다: ${filePath}`,
    )
  }

  try {
    return await response.json()
  } catch {
    throw new Error(
      `JSON 형식이 올바르지 않습니다: ${filePath}`,
    )
  }
}

/*
 * 특정 카테고리 데이터를 불러온다.
 *
 * 사용 예:
 *
 * const touristData =
 *   await loadCategoryData('tourist')
 */
export async function loadCategoryData(
  categoryKey,
) {
  const categoryConfig =
    CATEGORY_CONFIG[categoryKey]

  if (!categoryConfig) {
    throw new Error(
      `지원하지 않는 카테고리입니다: ${categoryKey}`,
    )
  }

  /*
   * 이미 불러온 데이터가 있으면
   * fetch 없이 저장된 배열을 반환한다.
   */
  if (categoryCache[categoryKey]) {
    return categoryCache[categoryKey]
  }

  const jsonData = await fetchJsonFile(
    categoryConfig.file,
  )

  /*
   * 정상적인 JSON 구조인지 확인한다.
   *
   * 기대 구조:
   * {
   *   region: '서울',
   *   contentType: '관광지',
   *   items: [...]
   * }
   */
  if (!Array.isArray(jsonData.items)) {
    throw new Error(
      `${categoryConfig.file} 파일에 items 배열이 없습니다.`,
    )
  }

  const normalizedItems = jsonData.items
    .map((item) =>
      normalizeItem(
        item,
        categoryKey,
        categoryConfig.name,
      ),
    )
    /*
     * 제목이 없는 데이터는 목록과 검색에서 제외한다.
     */
    .filter((item) => item.title)

  categoryCache[categoryKey] =
    normalizedItems

  return normalizedItems
}

/*
 * 모든 카테고리 데이터를 한 번에 불러온다.
 *
 * 챗봇과 통합 검색에서 사용한다.
 */
export async function loadAllLocalData() {
  if (allDataCache) {
    return allDataCache
  }

  const categoryKeys = Object.keys(
    CATEGORY_CONFIG,
  )

  const categoryDataList =
    await Promise.all(
      categoryKeys.map((categoryKey) =>
        loadCategoryData(categoryKey),
      ),
    )

  allDataCache = categoryDataList.flat()

  return allDataCache
}

/*
 * ID로 장소 한 건을 찾는다.
 *
 * 특정 카테고리가 정해져 있으면 해당 카테고리만 검색한다.
 */
export async function findLocalDataById(
  contentId,
  categoryKey = '',
) {
  const normalizedId =
    normalizeText(contentId)

  if (!normalizedId) {
    return null
  }

  const items = categoryKey
    ? await loadCategoryData(categoryKey)
    : await loadAllLocalData()

  return (
    items.find(
      (item) =>
        item.id === normalizedId,
    ) || null
  )
}

/*
 * 키워드로 서울 지역 데이터를 검색한다.
 *
 * 기본 검색 대상:
 * 제목, 주소, 전화번호, 카테고리
 */
export async function searchLocalData(
  keyword,
  options = {},
) {
  const normalizedKeyword =
    normalizeText(keyword).toLowerCase()

  if (!normalizedKeyword) {
    return []
  }

  const {
    categoryKey = '',
    limit = 20,
  } = options

  const items = categoryKey
    ? await loadCategoryData(categoryKey)
    : await loadAllLocalData()

  return items
    .filter((item) =>
      item.searchText.includes(
        normalizedKeyword,
      ),
    )
    .slice(0, limit)
}

/*
 * 이미지가 있는 데이터만 반환한다.
 *
 * 메인 배너나 추천 카드에서 사용할 수 있다.
 */
export async function getItemsWithImage(
  categoryKey,
  limit = 10,
) {
  const items = categoryKey
    ? await loadCategoryData(categoryKey)
    : await loadAllLocalData()

  return items
    .filter((item) => item.image)
    .slice(0, limit)
}

/*
 * 카테고리 데이터에서 무작위 항목을 반환한다.
 *
 * 메인 배너의 랜덤 관광지 등에 사용할 수 있다.
 */
export async function getRandomItems(
  categoryKey,
  count = 1,
  options = {},
) {
  const {
    imageOnly = false,
  } = options

  let items = categoryKey
    ? await loadCategoryData(categoryKey)
    : await loadAllLocalData()

  if (imageOnly) {
    items = items.filter(
      (item) => item.image,
    )
  }

  /*
   * 원본 배열 순서가 바뀌지 않도록 복사한다.
   */
  const shuffledItems = [...items]

  for (
    let index = shuffledItems.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    )

    ;[
      shuffledItems[index],
      shuffledItems[randomIndex],
    ] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ]
  }

  return shuffledItems.slice(0, count)
}

/*
 * 개발 중 캐시를 초기화할 때 사용하는 함수
 *
 * 실제 서비스에서는 거의 사용할 일이 없다.
 */
export function clearLocalDataCache() {
  Object.keys(categoryCache).forEach(
    (key) => {
      delete categoryCache[key]
    },
  )

  allDataCache = null
}