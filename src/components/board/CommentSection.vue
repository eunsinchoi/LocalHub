<script setup>
import { ref, onMounted, watch } from 'vue'
const props = defineProps({
  postId: { type: [String, Number], required: true }
})

const STORAGE_KEY = 'localhub_comments'
const author = ref('')
const content = ref('')
const comments = ref([])

function loadComments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    comments.value = (all[String(props.postId)] || []).slice().reverse()
  } catch {
    comments.value = []
  }
}

function saveCommentToStorage(list) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[String(props.postId)] = list.slice()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {}
}

function addComment() {
  const a = (author.value || '익명').trim()
  const c = (content.value || '').trim()
  if (!c) {
    alert('댓글 내용을 입력하세요.')
    return
  }
  const item = {
    id: Date.now(),
    author: a,
    content: c,
    createdAt: new Date().toISOString()
  }
  // prepend
  const raw = localStorage.getItem(STORAGE_KEY)
  const all = raw ? JSON.parse(raw) : {}
  const list = all[String(props.postId)] || []
  list.push(item)
  all[String(props.postId)] = list
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  author.value = ''
  content.value = ''
  loadComments()
}

function formatDate(iso) {
  if (!iso) return ''
  return iso.slice(0, 10) + ' ' + iso.slice(11, 19)
}

onMounted(loadComments)
watch(() => props.postId, loadComments)
</script>

<template>
  <section class="comment-section">
    <h3 class="sr-only">댓글</h3>

    <div class="comment-editor">
      <input v-model="author" placeholder="작성자" class="author-input" />
      <textarea v-model="content" rows="4" placeholder="댓글을 입력하세요." class="content-input"></textarea>
      <div class="editor-actions">
        <button class="btn add-comment" @click="addComment">등록</button>
      </div>
    </div>

    <div class="comment-list">
      <div v-if="comments.length === 0" class="no-comments">댓글이 없습니다.</div>
      <ul>
        <li v-for="c in comments" :key="c.id" class="comment-item">
          <div class="comment-head">
            <strong class="c-author">{{ c.author }}</strong>
            <span class="c-date">{{ formatDate(c.createdAt) }}</span>
          </div>
          <div class="c-content">{{ c.content }}</div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.comment-section {
  margin-top: 18px;
  max-width: 900px;
}

/* 에디터 영역: 테두리 강조 */
.comment-editor {
  border: 1.5px solid #e6e6e6;
  padding: 12px;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.author-input {
  width: 220px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.content-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
}
.editor-actions {
  display: flex;
  justify-content: flex-end;
}
.btn.add-comment {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1.4px solid #dcdcdc;
  background: #fafafa;
  cursor: pointer;
}

/* 댓글 목록 스타일 */
.comment-list {
  margin-top: 12px;
}
.comment-item {
  border-bottom: 1px dashed #eee;
  padding: 12px 8px;
}
.comment-head {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 6px;
}
.c-author {
  color: #333;
}
.c-date {
  color: #888;
  font-size: 0.85rem;
}
.c-content {
  color: #222;
  white-space: pre-wrap;
}
.no-comments {
  color: #888;
  padding: 12px 8px;
}
</style>
