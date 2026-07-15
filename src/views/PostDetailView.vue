<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PasswordModal from '../components/common/PasswordModal.vue'
import CommentSection from '../components/board/CommentSection.vue'
import postStorageService from '../services/postStorageService.js'
import bookmarkService from '../services/bookmarkService.js'

const route = useRoute()
const router = useRouter()
const postId = route.params.id || null

const post = ref(null)
const isBookmarked = ref(false)
const showPasswordModal = ref(false)

async function loadPost() {
  if (!postId) return
  post.value = await postStorageService.getPostById(postId)
  isBookmarked.value = bookmarkService.isBookmarked(postId)
}

function toggleBookmark() {
  if (!postId) return
  isBookmarked.value = !isBookmarked.value
  bookmarkService.toggleBookmark(postId)
}

function goBackToList() {
  router.push({ name: 'BoardList' })
}

function goEdit() {
  router.push({ name: 'PostEdit', params: { id: postId } })
}

async function removePost() {
  const ok = confirm('정말로 게시글을 삭제하시겠습니까?')
  if (!ok) return
  // 비밀번호 확인이 필요한 구현이면 showPasswordModal.value = true
  await postStorageService.deletePost(postId)
  router.push({ name: 'BoardList' })
}

function sharePost() {
  const shareData = {
    title: post.value?.title || '게시글',
    text: post.value?.content?.slice(0, 120),
    url: window.location.href
  }
  if (navigator.share) {
    navigator.share(shareData).catch(() => {})
  } else {
    // 복사 fallback
    navigator.clipboard?.writeText(window.location.href)
    alert('주소가 클립보드에 복사되었습니다.')
  }
}

onMounted(loadPost)
</script>

<template>
  <div class="post-detail-view">
    <!-- 상단: 로고(앱 공통 헤더 아래에 위치한다고 가정) 아래에 보드 정보 배치 -->
    <section class="board-info">
      <div class="board-name">{{ post?.boardName || '게시판' }}</div>
      <div class="board-sub">게시판 설명 또는 카테고리 정보</div>
    </section>

    <article class="post-article">
      <header class="post-header">
        <h1 class="post-title">
          {{ post?.title || '제목 없음' }}
        </h1>
        <button class="bookmark-btn" :aria-pressed="isBookmarked" @click="toggleBookmark">
          <span v-if="isBookmarked">★ 북마크</span>
          <span v-else>☆ 북마크</span>
        </button>
      </header>

      <div class="post-meta">
        <span class="author">작성자: {{ post?.author || '익명' }}</span>
        <span class="date">작성일: {{ post?.createdAt || '-' }}</span>
      </div>

      <section class="post-content">
        <img v-if="post?.image" :src="post.image" alt="게시글 이미지" class="post-image" />
        <div class="content-text" v-html="post?.content || ''"></div>
      </section>

      <footer class="post-footer">
        <div class="footer-left">
          <button class="btn list-btn" @click="goBackToList">목록으로</button>
          <button class="btn share-btn" @click="sharePost">공유</button>
        </div>

        <div class="footer-right">
          <button class="btn edit-btn" @click="goEdit">수정</button>
          <button class="btn delete-btn" @click="removePost">삭제</button>
        </div>
      </footer>
    </article>

    <CommentSection />
    <PasswordModal v-if="showPasswordModal" @close="showPasswordModal = false" />
  </div>
</template>

<style scoped>
.post-detail-view {
  max-width: 900px;
  margin: 24px auto;
  padding: 0 16px;
  color: #222;
  font-family: inherit;
}

/* 보드 정보: 로고(공통 헤더) 바로 아래 왼쪽에 위치 */
.board-info {
  margin-top: 8px;
  margin-bottom: 18px;
}
.board-name {
  font-weight: 700;
  font-size: 1.05rem;
  color: #ef5350;
}
.board-sub {
  color: #666;
  font-size: 0.9rem;
  margin-top: 4px;
}

/* 제목 + 북마크 */
.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.post-title {
  font-size: 1.6rem;
  margin: 0;
  line-height: 1.3;
  flex: 1 1 auto;
}
.bookmark-btn {
  background: transparent;
  border: 1px solid #eee;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
}

/* 작성자/작성일 */
.post-meta {
  margin-top: 8px;
  color: #777;
  font-size: 0.9rem;
  display: flex;
  gap: 12px;
}

/* 본문 */
.post-content {
  margin-top: 18px;
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}
.post-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin-bottom: 12px;
}
.content-text {
  white-space: pre-wrap;
  color: #333;
}

/* 푸터: 왼쪽(목록/공유) 오른쪽(수정/삭제) */
.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
}
.footer-left, .footer-right {
  display: flex;
  gap: 8px;
}
.btn {
  padding: 8px 12px;
  border-radius: 6px;
  background: #fafafa;
  border: 1px solid #e6e6e6;
  cursor: pointer;
}
.edit-btn {
  background: #fff9e6;
}
.delete-btn {
  background: #ffecec;
  border-color: #ffbdbd;
}
</style>