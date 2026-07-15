// src/services/postStorageService.js

const STORAGE_KEY = 'localhub_posts'

/*
 * 사용자 게시물 ID를 생성한다.
 */
function generateId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return [
    Date.now(),
    Math.random()
      .toString(36)
      .slice(2),
  ].join('-')
}

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
 * 태그를 문자열 배열로 변환한다.
 */
function normalizeTagList(tags) {
  if (Array.isArray(tags)) {
    return tags
      .map(normalizeText)
      .filter(Boolean)
  }

  const tagText = normalizeText(tags)

  if (!tagText) {
    return []
  }

  return tagText
    .split(/[\s,]+/)
    .map(normalizeText)
    .filter(Boolean)
}

/*
 * localStorage에서 사용자 게시물 원본을 가져온다.
 */
function loadRawPosts() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsedPosts =
      JSON.parse(raw)

    return Array.isArray(parsedPosts)
      ? parsedPosts
      : []
  } catch (error) {
    console.error(
      '사용자 게시물을 불러오지 못했습니다.',
      error,
    )

    return []
  }
}

/*
 * 사용자 게시물 원본을 localStorage에 저장한다.
 */
function saveRawPosts(posts) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(posts),
    )

    return true
  } catch (error) {
    console.error(
      '사용자 게시물을 저장하지 못했습니다.',
      error,
    )

    return false
  }
}

/*
 * 예전에 저장된 게시물에 id, 날짜가 없으면
 * 자동으로 값을 생성해서 저장한다.
 */
function ensurePostIdentity(posts) {
  let changed = false

  const normalizedPosts = posts.map(
    (post) => {
      const normalizedPost = {
        ...(post || {}),
      }

      if (!normalizeText(normalizedPost.id)) {
        normalizedPost.id = generateId()
        changed = true
      }

      if (
        !normalizeText(
          normalizedPost.createdAt,
        )
      ) {
        normalizedPost.createdAt =
          normalizeText(
            normalizedPost.date,
          ) ||
          new Date().toISOString()

        changed = true
      }

      if (
        !normalizeText(
          normalizedPost.modifiedAt,
        )
      ) {
        normalizedPost.modifiedAt =
          normalizeText(
            normalizedPost.updatedAt,
          ) ||
          normalizedPost.createdAt

        changed = true
      }

      return normalizedPost
    },
  )

  if (changed) {
    saveRawPosts(normalizedPosts)
  }

  return normalizedPosts
}

/*
 * 사용자 게시물 한 건을 화면에서 사용하는
 * 공통 구조로 변환한다.
 */
function normalizePost(post) {
  const id =
    normalizeText(post.id)

  const title =
    normalizeText(post.title)

  const content =
    normalizeText(post.content)

  /*
   * categoryKey 예:
   * tourist, culture, festival,
   * course, leports, shopping
   */
  const categoryKey =
    normalizeText(
      post.categoryKey ||
      post.boardKey,
    )

  /*
   * category 예:
   * 관광지, 문화시설, 축제공연
   */
  const category =
    normalizeText(
      post.category ||
      post.contentType ||
      post.categoryName,
    )

  const tagList =
    normalizeTagList(post.tags)

  const tags =
    tagList.join(' ')

  const createdAt =
    normalizeText(
      post.createdAt ||
      post.date,
    )

  const modifiedAt =
    normalizeText(
      post.modifiedAt ||
      post.updatedAt ||
      createdAt,
    )

  const nickname =
    normalizeText(
      post.nickname ||
      post.author,
    )

  return {
    ...post,

    /*
     * 사용자 게시물임을 표시한다.
     */
    source: 'user',

    id,
    contentId: id,

    categoryKey,
    category,

    /*
     * JSON 콘텐츠와 필드명을 맞추기 위해 제공한다.
     */
    contentType: category,

    title,
    content,

    tags,
    tagList,

    nickname,
    author: nickname,

    createdAt,
    modifiedAt,

    /*
     * 검색용 통합 문자열
     */
    searchText: [
      title,
      content,
      tags,
      category,
      nickname,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),

    /*
     * 저장된 원본 데이터
     */
    raw: post,
  }
}

/*
 * 사용자 게시물 전체를 반환한다.
 */
export function getPosts() {
  const rawPosts =
    ensurePostIdentity(
      loadRawPosts(),
    )

  return rawPosts.map(normalizePost)
}

/*
 * ID로 사용자 게시물 한 건을 가져온다.
 */
export function getPostById(postId) {
  const normalizedPostId =
    normalizeText(postId)

  if (!normalizedPostId) {
    return null
  }

  const posts = getPosts()

  return (
    posts.find(
      (post) =>
        post.id === normalizedPostId,
    ) || null
  )
}

/*
 * 사용자 게시물을 생성한다.
 */
export function createPost(postData) {
  const posts =
    ensurePostIdentity(
      loadRawPosts(),
    )

  const now =
    new Date().toISOString()

  const categoryKey =
    normalizeText(
      postData.categoryKey ||
      postData.boardKey,
    )

  const category =
    normalizeText(
      postData.category ||
      postData.contentType ||
      postData.categoryName,
    )

  const item = {
    ...postData,

    id: generateId(),

    categoryKey,
    category,
    contentType: category,

    createdAt: now,
    modifiedAt: now,
  }

  posts.unshift(item)

  const saved =
    saveRawPosts(posts)

  if (!saved) {
    return null
  }

  return normalizePost(item)
}

/*
 * 사용자 게시물을 수정한다.
 */
export function updatePost(
  postId,
  postData,
) {
  const posts =
    ensurePostIdentity(
      loadRawPosts(),
    )

  const normalizedPostId =
    normalizeText(postId)

  const index = posts.findIndex(
    (post) =>
      normalizeText(post.id) ===
      normalizedPostId,
  )

  if (index === -1) {
    return null
  }

  const currentPost = posts[index]

  const categoryKey =
    normalizeText(
      postData.categoryKey ??
      postData.boardKey ??
      currentPost.categoryKey ??
      currentPost.boardKey,
    )

  const category =
    normalizeText(
      postData.category ??
      postData.contentType ??
      postData.categoryName ??
      currentPost.category ??
      currentPost.contentType ??
      currentPost.categoryName,
    )

  const updatedPost = {
    ...currentPost,
    ...postData,

    /*
     * ID와 최초 작성일은 수정되지 않도록 한다.
     */
    id: currentPost.id,

    categoryKey,
    category,
    contentType: category,

    createdAt:
      currentPost.createdAt,

    modifiedAt:
      new Date().toISOString(),
  }

  posts[index] = updatedPost

  const saved =
    saveRawPosts(posts)

  if (!saved) {
    return null
  }

  return normalizePost(updatedPost)
}

/*
 * 사용자 게시물을 삭제한다.
 */
export function deletePost(postId) {
  const posts =
    ensurePostIdentity(
      loadRawPosts(),
    )

  const normalizedPostId =
    normalizeText(postId)

  const filteredPosts =
    posts.filter(
      (post) =>
        normalizeText(post.id) !==
        normalizedPostId,
    )

  /*
   * 해당 ID의 게시물이 없었던 경우
   */
  if (
    filteredPosts.length ===
    posts.length
  ) {
    return false
  }

  return saveRawPosts(filteredPosts)
}

/*
 * 개발 중 모든 사용자 게시물을 초기화할 때 사용한다.
 */
export function clearPosts() {
  try {
    localStorage.removeItem(
      STORAGE_KEY,
    )

    return true
  } catch (error) {
    console.error(
      '사용자 게시물을 초기화하지 못했습니다.',
      error,
    )

    return false
  }
}