const BOOKMARK_STORAGE_KEY = 'bookmarks'

export function getBookmarks() {
  try {
    const savedBookmarks = localStorage.getItem(BOOKMARK_STORAGE_KEY)

    return savedBookmarks ? JSON.parse(savedBookmarks) : []
  } catch (error) {
    console.error('북마크를 불러오지 못했습니다.', error)
    return []
  }
}

export function isBookmarked(postId) {
  const bookmarks = getBookmarks()

  return bookmarks.includes(String(postId))
}

export function toggleBookmark(postId) {
  const bookmarks = getBookmarks()
  const normalizedPostId = String(postId)

  let updatedBookmarks

  if (bookmarks.includes(normalizedPostId)) {
    updatedBookmarks = bookmarks.filter(
      (bookmarkId) => bookmarkId !== normalizedPostId,
    )
  } else {
    updatedBookmarks = [...bookmarks, normalizedPostId]
  }

  localStorage.setItem(
    BOOKMARK_STORAGE_KEY,
    JSON.stringify(updatedBookmarks),
  )

  return updatedBookmarks.includes(normalizedPostId)
}