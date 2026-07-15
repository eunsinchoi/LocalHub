// src/services/contentFeedService.js

import {
    CATEGORY_CONFIG,
    loadAllLocalData,
  } from './localDataService'
  
  import {
    getPosts,
  } from './postStorageService'
  
  /*
   * 카테고리 이름을 키로 변환하기 위한 객체
   *
   * 예:
   * 관광지 → tourist
   * 문화시설 → culture
   */
  const CATEGORY_NAME_TO_KEY =
    Object.entries(CATEGORY_CONFIG)
      .reduce(
        (
          categoryMap,
          [categoryKey, categoryConfig],
        ) => {
          categoryMap[
            categoryConfig.name
          ] = categoryKey
  
          return categoryMap
        },
        {},
      )
  
  /*
   * null, undefined 등을 안전하게 문자열로 변환한다.
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
   * 전달받은 카테고리 값이
   * 키인지 한글 이름인지 확인한 뒤
   * 내부 카테고리 키로 변환한다.
   *
   * 예:
   * tourist → tourist
   * 관광지 → tourist
   */
  function resolveCategoryKey(
    categoryValue,
  ) {
    const normalizedCategory =
      normalizeText(categoryValue)
  
    if (!normalizedCategory) {
      return ''
    }
  
    if (
      CATEGORY_CONFIG[
        normalizedCategory
      ]
    ) {
      return normalizedCategory
    }
  
    return (
      CATEGORY_NAME_TO_KEY[
        normalizedCategory
      ] || ''
    )
  }
  
  /*
   * 콘텐츠 객체에서 카테고리 키를 가져온다.
   */
  function getItemCategoryKey(item) {
    const directCategoryKey =
      resolveCategoryKey(
        item.categoryKey ||
        item.boardKey,
      )
  
    if (directCategoryKey) {
      return directCategoryKey
    }
  
    return resolveCategoryKey(
      item.category ||
      item.contentType ||
      item.categoryName,
    )
  }
  
  /*
   * 콘텐츠 객체에서 한글 카테고리명을 가져온다.
   */
  function getItemCategoryName(
    item,
    categoryKey,
  ) {
    const directCategoryName =
      normalizeText(
        item.category ||
        item.contentType ||
        item.categoryName,
      )
  
    if (directCategoryName) {
      return directCategoryName
    }
  
    return (
      CATEGORY_CONFIG[
        categoryKey
      ]?.name || ''
    )
  }
  
  /*
   * 날짜를 정렬 가능한 숫자로 변환한다.
   */
  function getTimestamp(value) {
    const dateText =
      normalizeText(value)
  
    if (!dateText) {
      return 0
    }
  
    /*
     * TourAPI 원본 날짜 형식도 처리한다.
     *
     * 예:
     * 20260715153000
     */
    if (/^\d{8,14}$/.test(dateText)) {
      const year =
        dateText.slice(0, 4)
  
      const month =
        dateText.slice(4, 6) || '01'
  
      const day =
        dateText.slice(6, 8) || '01'
  
      const hour =
        dateText.slice(8, 10) || '00'
  
      const minute =
        dateText.slice(10, 12) || '00'
  
      const second =
        dateText.slice(12, 14) || '00'
  
      return new Date(
        `${year}-${month}-${day}` +
        `T${hour}:${minute}:${second}`,
      ).getTime()
    }
  
    /*
     * 2026-07-15 15:30 형식을
     * ISO 형식으로 바꿔 처리한다.
     */
    const normalizedDateText =
      dateText.replace(' ', 'T')
  
    const timestamp =
      new Date(
        normalizedDateText,
      ).getTime()
  
    return Number.isNaN(timestamp)
      ? 0
      : timestamp
  }
  
  /*
   * 콘텐츠의 최종 수정일을 가져온다.
   */
  function getContentDate(content) {
    return (
      content.modifiedAt ||
      content.updatedAt ||
      content.createdAt ||
      content.date ||
      content.raw?.modifiedtime ||
      content.raw?.createdtime ||
      ''
    )
  }
  
  /*
   * JSON 데이터를 화면 공통 구조로 변환한다.
   *
   * localDataService에서 이미 대부분 정규화되어 있으므로
   * source와 일부 공통 필드만 추가한다.
   */
  function normalizeLocalContent(item) {
    const categoryKey =
      getItemCategoryKey(item)
  
    const category =
      getItemCategoryName(
        item,
        categoryKey,
      )
  
    const id =
      normalizeText(
        item.id ||
        item.contentId,
      )
  
    return {
      ...item,
  
      source: 'local',
  
      /*
       * JSON과 사용자 게시물의 ID가 같을 수 있으므로
       * 화면의 :key 등에는 feedId를 사용할 수 있다.
       */
      feedId: `local:${id}`,
  
      id,
      contentId: id,
  
      categoryKey,
      category,
      contentType: category,
  
      modifiedAt:
        item.modifiedAt ||
        item.createdAt,
    }
  }
  
  /*
   * 사용자 게시물을 화면 공통 구조로 변환한다.
   */
  function normalizeUserContent(post) {
    const categoryKey =
      getItemCategoryKey(post)
  
    const category =
      getItemCategoryName(
        post,
        categoryKey,
      )
  
    const id =
      normalizeText(post.id)
  
    return {
      ...post,
  
      source: 'user',
  
      feedId: `user:${id}`,
  
      id,
      contentId: id,
  
      categoryKey,
      category,
      contentType: category,
  
      modifiedAt:
        post.modifiedAt ||
        post.createdAt,
    }
  }
  
  /*
   * JSON 데이터와 사용자 게시물을 모두 합쳐 반환한다.
   *
   * JSON 데이터:
   * localDataService에서 가져온다.
   *
   * 사용자 게시물:
   * postStorageService에서 가져온다.
   *
   * 사용자 게시물은 localStorage에서 매번 새로 읽으므로
   * 게시물 작성, 수정, 삭제 결과가 바로 반영된다.
   */
  export async function getAllContents() {
    const localContents =
      await loadAllLocalData()
  
    const userPosts =
      getPosts()
  
    const combinedContents = [
      ...localContents.map(
        normalizeLocalContent,
      ),
  
      ...userPosts.map(
        normalizeUserContent,
      ),
    ]
  
    return combinedContents.sort(
      (firstContent, secondContent) => {
        return (
          getTimestamp(
            getContentDate(
              secondContent,
            ),
          ) -
          getTimestamp(
            getContentDate(
              firstContent,
            ),
          )
        )
      },
    )
  }
  
  /*
   * 특정 카테고리의 콘텐츠만 반환한다.
   *
   * categoryValue에는 내부 키 또는 한글 이름을
   * 모두 전달할 수 있다.
   *
   * 예:
   * getContentsByCategory('tourist')
   * getContentsByCategory('관광지')
   */
  export async function getContentsByCategory(
    categoryValue,
  ) {
    const categoryKey =
      resolveCategoryKey(categoryValue)
  
    if (!categoryKey) {
      throw new Error(
        `지원하지 않는 카테고리입니다: ${categoryValue}`,
      )
    }
  
    const allContents =
      await getAllContents()
  
    return allContents.filter(
      (content) =>
        content.categoryKey ===
        categoryKey,
    )
  }
  
  /*
   * ID로 콘텐츠 한 건을 찾는다.
   *
   * source를 지정하면 JSON 또는 사용자 게시물만 검색한다.
   *
   * 예:
   * findContentById(id)
   * findContentById(id, 'local')
   * findContentById(id, 'user')
   */
  export async function findContentById(
    contentId,
    source = '',
  ) {
    const normalizedId =
      normalizeText(contentId)
  
    const normalizedSource =
      normalizeText(source)
  
    if (!normalizedId) {
      return null
    }
  
    const allContents =
      await getAllContents()
  
    return (
      allContents.find((content) => {
        const isSameId =
          normalizeText(content.id) ===
          normalizedId
  
        if (!isSameId) {
          return false
        }
  
        if (!normalizedSource) {
          return true
        }
  
        return (
          content.source ===
          normalizedSource
        )
      }) || null
    )
  }
  
  /*
   * 키워드로 전체 콘텐츠를 검색한다.
   *
   * options:
   * categoryKey - 특정 카테고리만 검색
   * limit       - 최대 결과 개수
   */
  export async function searchContents(
    keyword,
    options = {},
  ) {
    const normalizedKeyword =
      normalizeText(keyword)
        .toLowerCase()
  
    if (!normalizedKeyword) {
      return []
    }
  
    const {
      categoryKey = '',
      limit = 20,
    } = options
  
    let contents =
      await getAllContents()
  
    if (categoryKey) {
      const resolvedCategoryKey =
        resolveCategoryKey(
          categoryKey,
        )
  
      if (!resolvedCategoryKey) {
        return []
      }
  
      contents = contents.filter(
        (content) =>
          content.categoryKey ===
          resolvedCategoryKey,
      )
    }
  
    return contents
      .filter((content) => {
        const searchText =
          normalizeText(
            content.searchText,
          ).toLowerCase()
  
        if (searchText) {
          return searchText.includes(
            normalizedKeyword,
          )
        }
  
        const fallbackSearchText = [
          content.title,
          content.content,
          content.address,
          content.category,
          content.tags,
        ]
          .map(normalizeText)
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
  
        return fallbackSearchText.includes(
          normalizedKeyword,
        )
      })
      .slice(0, limit)
  }
  
  /*
   * 최신 콘텐츠 일부만 반환한다.
   */
  export async function getRecentContents(
    limit = 10,
  ) {
    const contents =
      await getAllContents()
  
    const normalizedLimit =
      Number(limit)
  
    if (
      !Number.isFinite(
        normalizedLimit,
      ) ||
      normalizedLimit <= 0
    ) {
      return []
    }
  
    return contents.slice(
      0,
      normalizedLimit,
    )
  }