// src/services/bookmarkService.js

const BOOKMARK_STORAGE_KEY = 'bookmarks'

function normalizeBookmarkId(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return ''
  }

  return String(value).trim()
}

function saveBookmarks(bookmarks) {
  try {
    localStorage.setItem(
      BOOKMARK_STORAGE_KEY,
      JSON.stringify(bookmarks),
    )

    return true
  } catch (error) {
    console.error(
      '북마크를 저장하지 못했습니다.',
      error,
    )

    return false
  }
}

export function getBookmarks() {
  try {
    const savedBookmarks =
      localStorage.getItem(
        BOOKMARK_STORAGE_KEY,
      )

    if (!savedBookmarks) {
      return []
    }

    const parsedBookmarks =
      JSON.parse(savedBookmarks)

    if (
      !Array.isArray(
        parsedBookmarks,
      )
    ) {
      return []
    }

    return parsedBookmarks
      .map(normalizeBookmarkId)
      .filter(Boolean)
  } catch (error) {
    console.error(
      '북마크를 불러오지 못했습니다.',
      error,
    )

    return []
  }
}

export function isBookmarked(
  bookmarkId,
) {
  const normalizedBookmarkId =
    normalizeBookmarkId(
      bookmarkId,
    )

  if (!normalizedBookmarkId) {
    return false
  }

  return getBookmarks().includes(
    normalizedBookmarkId,
  )
}

export function toggleBookmark(
  bookmarkId,
) {
  const normalizedBookmarkId =
    normalizeBookmarkId(
      bookmarkId,
    )

  if (!normalizedBookmarkId) {
    return false
  }

  const bookmarks =
    getBookmarks()

  const alreadyBookmarked =
    bookmarks.includes(
      normalizedBookmarkId,
    )

  const updatedBookmarks =
    alreadyBookmarked
      ? bookmarks.filter(
          (savedBookmarkId) =>
            savedBookmarkId !==
            normalizedBookmarkId,
        )
      : [
          ...bookmarks,
          normalizedBookmarkId,
        ]

  const saved =
    saveBookmarks(
      updatedBookmarks,
    )

  if (!saved) {
    return alreadyBookmarked
  }

  return !alreadyBookmarked
}

export function removeBookmark(
  bookmarkId,
) {
  const normalizedBookmarkId =
    normalizeBookmarkId(
      bookmarkId,
    )

  if (!normalizedBookmarkId) {
    return false
  }

  const bookmarks =
    getBookmarks()

  const updatedBookmarks =
    bookmarks.filter(
      (savedBookmarkId) =>
        savedBookmarkId !==
        normalizedBookmarkId,
    )

  return saveBookmarks(
    updatedBookmarks,
  )
}

export function clearBookmarks() {
  try {
    localStorage.removeItem(
      BOOKMARK_STORAGE_KEY,
    )

    return true
  } catch (error) {
    console.error(
      '북마크를 초기화하지 못했습니다.',
      error,
    )

    return false
  }
}