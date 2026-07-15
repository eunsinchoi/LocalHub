// src/services/postStorageService.js

const STORAGE_KEY = 'localhub_posts'

function loadRawPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRawPosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  } catch {
    // ignore
  }
}

function normalizeText(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

export function getPosts() {
  const posts = loadRawPosts()
  return posts.map((p) => {
    const title = normalizeText(p.title)
    const content = normalizeText(p.content)
    const tags = Array.isArray(p.tags) ? p.tags.join(' ') : normalizeText(p.tags)
    const createdAt = p.createdAt || p.createdAt === 0 ? p.createdAt : new Date().toISOString()

    return {
      id: normalizeText(p.id) || String(p.createdAt) || String(Math.floor(Math.random() * 1e9)),
      title,
      content,
      tags,
      createdAt,
      // searchText: lowercase combined string for simple text search
      searchText: [title, content, tags].filter(Boolean).join(' ').toLowerCase(),
      // keep raw for possible UI use
      raw: p,
    }
  })
}

export function createPost(postData) {
  const posts = loadRawPosts()
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
  const createdAt = new Date().toISOString()
  const item = { ...postData, id, createdAt }
  posts.unshift(item)
  saveRawPosts(posts)
  return item
}

export function updatePost(postId, postData) {
  const posts = loadRawPosts()
  const idx = posts.findIndex((p) => String(p.id) === String(postId))
  if (idx === -1) return null
  posts[idx] = { ...posts[idx], ...postData }
  saveRawPosts(posts)
  return posts[idx]
}

export function deletePost(postId) {
  const posts = loadRawPosts()
  const filtered = posts.filter((p) => String(p.id) !== String(postId))
  saveRawPosts(filtered)
  return true
}