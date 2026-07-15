<template>
  <div class="post-detail-view">
    <div v-if="isLoading" class="state">게시글을 불러오는 중입니다...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <article v-else-if="post" class="post-card">
      <header class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-meta">
          <span class="category" v-if="post.categoryName">{{ post.categoryName }}</span>
          <span class="date">{{ formatDate(post.modifiedtime) }}</span>
        </div>
      </header>

      <div class="post-body">
        <figure v-if="post.firstimage || post.firstimage2" class="post-image">
          <img :src="post.firstimage || post.firstimage2" :alt="post.title" />
        </figure>

        <dl class="post-info">
          <div class="info-row" v-if="post.addr1 || post.addr2">
            <dt>주소</dt>
            <dd>{{ [post.addr1, post.addr2].filter(Boolean).join(' ') }}</dd>
          </div>
          <div class="info-row" v-if="post.tel">
            <dt>전화</dt>
            <dd>{{ post.tel }}</dd>
          </div>
        </dl>
      </div>
    </article>

    <CommentSection v-if="post" />
    <PasswordModal />
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PasswordModal from '../components/common/PasswordModal.vue'
import CommentSection from '../components/board/CommentSection.vue'
import { getPosts, deletePost } from '../services/postStorageService.js'
import {
  isBookmarked as checkBookmarked,
  toggleBookmark as updateBookmark,
} from '../services/bookmarkService.js'

const route = useRoute()
const router = useRouter()
const postId = route.params.id || null

const post = ref(null)
const isBookmarked = ref(false)
const showPasswordModal = ref(false)

function loadPost() {
  if (!postId) return
  const posts = getPosts()
  post.value =
    posts.find((item) => String(item.id) === String(postId))
    || null
  isBookmarked.value = checkBookmarked(postId)
}

function toggleBookmark() {
  if (!postId) return
  isBookmarked.value = updateBookmark(postId)
}

function goBackToList() {
  router.push({ name: 'BoardList' })
}

function goEdit() {
  router.push({
    name: 'PostEdit',
    params: { id: postId },
  })
}

function removePost() {
  const ok = confirm('정말로 게시글을 삭제하시겠습니까?')
  if (!ok || !postId) return
  deletePost(postId)
  router.push({ name: 'BoardList' })
}

function sharePost() {
  const shareData = {
    title: post.value?.title || '게시글',
    text: post.value?.content?.slice(0, 120),
    url: window.location.href,
  }
  if (navigator.share) {
    navigator.share(shareData).catch(() => {})
    return
  }
  navigator.clipboard?.writeText(window.location.href)
  alert('주소가 클립보드에 복사되었습니다.')
}

onMounted(loadPost)

const boardCrumb = computed(() => {
  // post.raw.boardName 이 있다면 그 값을, 없으면 기본 '관광지' 사용
  const category = post.value?.raw?.boardName || '관광지'
  return `홈 > ${category} > 게시글`
})
</script>

<template>
  <div class="post-detail-view">
    <section class="board-info">
      <div class="breadcrumb">{{ boardCrumb }}</div>
      <div class="board-sub">게시판 설명 또는 카테고리 정보</div>
    </section>

    <article class="post-article">
      <header class="post-header">
        <h1 class="post-title">{{ post?.title || '제목 없음' }}</h1>

        <button
          class="bookmark-btn"
          :aria-pressed="isBookmarked"
          @click="toggleBookmark"
          :title="isBookmarked ? '북마크 해제' : '북마크'"
        >
          <!-- 리본 아이콘 (토글에 따라 색 변경) -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 2H18V16L12 13L6 16V2Z"
              :fill="isBookmarked ? '#c8323e' : 'none'"
              stroke="#333"
              stroke-width="1.2"
            />
          </svg>
        </button>
      </header>

      <div class="post-meta">
        <span class="author">작성자: {{ post?.raw?.author || post?.author || '익명' }}</span>
        <span class="date">작성일: {{ post?.createdAt ? post.createdAt.slice(0,10) : '-' }}</span>
      </div>

      <section class="post-content">
        <img v-if="post?.raw?.image || post?.image" :src="post?.raw?.image || post.image" alt="게시글 이미지" class="post-image" />
        <div class="content-text" v-html="post?.content || post?.raw?.content || ''"></div>
      </section>

      <footer class="post-footer">
        <div class="footer-left">
          <button class="btn list-btn" @click="goBackToList">목록으로</button>
          <button class="btn share-btn" @click="sharePost">
            <!-- 공유 아이콘 -->
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke="#333" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 6l-4-4-4 4" stroke="#333" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 2v13" stroke="#333" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            공유
          </button>
        </div>

        <div class="footer-right">
          <button class="btn edit-btn" @click="goEdit">수정</button>
          <button class="btn delete-btn" @click="removePost">삭제</button>
        </div>
      </footer>
    </article>

    <CommentSection :post-id="postId" />
    <PasswordModal v-if="showPasswordModal" @close="showPasswordModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// 파일 경로가 다를 수 있으니 확인해주세요. 
// 같은 views 폴더 내라면 ./ 를, components 폴더에 있다면 ../components/.. 를 사용하세요.
import PasswordModal from '../components/common/PasswordModal.vue'
import CommentSection from '../components/board/CommentSection.vue'

const route = useRoute()
const post = ref(null)
const isLoading = ref(true)
const error = ref('')

const fileData = [
  { name: '서울_관광지.json', cat: '관광지' },
  { name: '서울_레포츠.json', cat: '레포츠' },
  { name: '서울_문화시설.json', cat: '문화시설' },
  { name: '서울_쇼핑.json', cat: '쇼핑' },
  { name: '서울_숙박.json', cat: '숙박' },
  { name: '서울_여행코스.json', cat: '여행코스' },
  { name: '서울_축제공연행사.json', cat: '축제공연' }
]

function formatDate(modifiedtime) {
  if (!modifiedtime) return ''
  const s = String(modifiedtime)
  if (s.length >= 8) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`
  return s
}

onMounted(async () => {
  const id = route.params.id
  if (!id) {
    error.value = '잘못된 게시글입니다.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  try {
    for (const f of fileData) {
      const res = await fetch(`/data/${f.name}`)
      if (!res.ok) continue
      const data = await res.json()
      if (!data || !Array.isArray(data.items)) continue

      const found = data.items.find((it) => String(it.contentid) === String(id))
      if (found) {
        post.value = { ...found, categoryName: f.cat }
        break
      }
    }
    if (!post.value) error.value = '게시글을 찾을 수 없습니다.'
  } catch (e) {
    error.value = '게시글을 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* 여기에 스타일을 그대로 두시면 됩니다 */
.post-detail-view {
  max-width: 900px;
  margin: 24px auto;
  padding: 0 16px;
  color: #222;
  font-family: inherit;
}

/* 빵부스러기 */
.board-info {
  margin-top: 8px;
  margin-bottom: 18px;
}
.breadcrumb {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 6px;
}
.board-sub {
  color: #666;
  font-size: 0.9rem;
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
  border: 1px solid transparent;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.bookmark-btn[aria-pressed="true"] svg path { stroke: #c8323e; }

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
/* 버튼 테두리 굵기 증가: 가시성 개선 */
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
  border: 1.6px solid #e6e6e6; /* 기존 1px -> 1.6px */
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn .icon { display:inline-block; vertical-align:middle; }

/* 개별 컬러 */
.edit-btn {
  background: #fff9e6;
}
.delete-btn {
  background: #ffecec;
  border-color: #ffbdbd;
}
</style>