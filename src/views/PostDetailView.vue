<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import PasswordModal from '../components/common/PasswordModal.vue'
import CommentSection from '../components/board/CommentSection.vue'

import {
  deletePost,
  getPosts,
} from '../services/postStorageService.js'

import {
  isBookmarked as checkBookmarked,
  toggleBookmark as updateBookmark,
} from '../services/bookmarkService.js'

const route = useRoute()
const router = useRouter()

const postId = route.params.id || null

const post = ref(null)
const isLoading = ref(true)
const error = ref('')

const isBookmarked = ref(false)
const showPasswordModal = ref(false)
const pendingAction = ref('')

const boardCrumb = computed(() => {
  const category =
    post.value?.categoryName ||
    post.value?.raw?.boardName ||
    '관광지'

  return `홈 > ${category} > 게시글`
})

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const stringValue = String(value)

  if (/^\d{8}/.test(stringValue)) {
    return `${stringValue.slice(0, 4)}-${stringValue.slice(4, 6)}-${stringValue.slice(6, 8)}`
  }

  if (stringValue.includes('T')) {
    return stringValue.slice(0, 10)
  }

  return stringValue
}

function loadPost() {
  if (!postId) {
    error.value = '잘못된 게시글입니다.'
    isLoading.value = false
    return
  }

  try {
    const posts = getPosts()

    post.value =
      posts.find(
        (item) =>
          String(item.id) === String(postId),
      ) || null

    if (!post.value) {
      error.value =
        '게시글을 찾을 수 없습니다.'
      return
    }

    isBookmarked.value =
      checkBookmarked(postId)
  } catch (loadError) {
    console.error(
      '게시글 조회 실패:',
      loadError,
    )

    error.value =
      '게시글을 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

function toggleBookmark() {
  if (!postId) {
    return
  }

  isBookmarked.value =
    updateBookmark(postId)
}

function goBackToList() {
  const category =
    post.value?.category ||
    route.params.category ||
    'tourist'

  router.push(`/board/${category}`)
}

function requestEdit() {
  pendingAction.value = 'edit'
  showPasswordModal.value = true
}

function requestDelete() {
  pendingAction.value = 'delete'
  showPasswordModal.value = true
}

function closePasswordModal() {
  showPasswordModal.value = false
  pendingAction.value = ''
}

function confirmPassword(password) {
  const savedPassword =
    post.value?.password

  if (
    !savedPassword ||
    password !== savedPassword
  ) {
    window.alert(
      '비밀번호가 일치하지 않습니다.',
    )
    return
  }

  if (pendingAction.value === 'edit') {
    router.push({
      name: 'PostEdit',
      params: {
        id: postId,
      },
    })
  }

  if (pendingAction.value === 'delete') {
    const shouldDelete =
      window.confirm(
        '정말로 게시글을 삭제하시겠습니까?',
      )

    if (!shouldDelete) {
      return
    }

    deletePost(postId)
    goBackToList()
  }

  closePasswordModal()
}

async function sharePost() {
  const shareData = {
    title:
      post.value?.title ||
      '게시글',
    text:
      post.value?.content?.slice(
        0,
        120,
      ) || '',
    url: window.location.href,
  }

  if (navigator.share) {
    try {
      await navigator.share(
        shareData,
      )
    } catch {
      // 사용자가 공유창을 닫은 경우
    }

    return
  }

  await navigator.clipboard?.writeText(
    window.location.href,
  )

  window.alert(
    '주소가 클립보드에 복사되었습니다.',
  )
}

onMounted(loadPost)
</script>

<template>
  <main class="post-detail-view">
    <div
      v-if="isLoading"
      class="state"
    >
      게시글을 불러오는 중입니다...
    </div>

    <div
      v-else-if="error"
      class="state error"
    >
      {{ error }}
    </div>

    <template v-else-if="post">
      <section class="board-info">
        <div class="breadcrumb">
          {{ boardCrumb }}
        </div>

        <div class="board-sub">
          게시판 상세 내용
        </div>
      </section>

      <article class="post-article">
        <header class="post-header">
          <h1 class="post-title">
            {{ post.title || '제목 없음' }}
          </h1>

          <button
            type="button"
            class="bookmark-btn"
            :aria-pressed="isBookmarked"
            :title="
              isBookmarked
                ? '북마크 해제'
                : '북마크'
            "
            @click="toggleBookmark"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 2H18V16L12 13L6 16V2Z"
                :fill="
                  isBookmarked
                    ? '#c8323e'
                    : 'none'
                "
                stroke="#333"
                stroke-width="1.2"
              />
            </svg>
          </button>
        </header>

        <div class="post-meta">
          <span class="author">
            작성자:
            {{
              post.raw?.author ||
              post.author ||
              '익명'
            }}
          </span>

          <span class="date">
            작성일:
            {{
              formatDate(
                post.createdAt ||
                post.modifiedtime,
              )
            }}
          </span>
        </div>

        <section class="post-content">
          <img
            v-if="
              post.raw?.image ||
              post.image ||
              post.firstimage ||
              post.firstimage2
            "
            :src="
              post.raw?.image ||
              post.image ||
              post.firstimage ||
              post.firstimage2
            "
            :alt="post.title"
            class="post-image"
          />

          <div class="content-text">
            {{
              post.content ||
              post.raw?.content ||
              ''
            }}
          </div>

          <dl
            v-if="
              post.addr1 ||
              post.addr2 ||
              post.tel
            "
            class="post-info"
          >
            <div
              v-if="
                post.addr1 ||
                post.addr2
              "
              class="info-row"
            >
              <dt>주소</dt>

              <dd>
                {{
                  [
                    post.addr1,
                    post.addr2,
                  ]
                    .filter(Boolean)
                    .join(' ')
                }}
              </dd>
            </div>

            <div
              v-if="post.tel"
              class="info-row"
            >
              <dt>전화</dt>
              <dd>{{ post.tel }}</dd>
            </div>
          </dl>
        </section>

        <footer class="post-footer">
          <div class="footer-left">
            <button
              type="button"
              class="btn list-btn"
              @click="goBackToList"
            >
              목록으로
            </button>

            <button
              type="button"
              class="btn share-btn"
              @click="sharePost"
            >
              공유
            </button>
          </div>

          <div class="footer-right">
            <button
              type="button"
              class="btn edit-btn"
              @click="requestEdit"
            >
              수정
            </button>

            <button
              type="button"
              class="btn delete-btn"
              @click="requestDelete"
            >
              삭제
            </button>
          </div>
        </footer>
      </article>

      <CommentSection
        :post-id="postId"
      />
    </template>

    <PasswordModal
      :is-open="showPasswordModal"
      :title="
        pendingAction === 'delete'
          ? '게시글 삭제'
          : '게시글 수정'
      "
      :description="
        pendingAction === 'delete'
          ? '삭제하려면 게시글 작성 시 설정한 비밀번호를 입력해주세요.'
          : '수정하려면 게시글 작성 시 설정한 비밀번호를 입력해주세요.'
      "
      :confirm-text="
        pendingAction === 'delete'
          ? '삭제'
          : '확인'
      "
      @close="closePasswordModal"
      @confirm="confirmPassword"
    />
  </main>
</template>

<style scoped>
.post-detail-view {
  width: 100%;
  max-width: 900px;
  min-height: calc(100vh - 72px);
  margin: 0 auto;
  padding: 32px 16px 70px;

  color: #222222;
}

.state {
  padding: 80px 20px;

  color: #666666;
  text-align: center;
}

.state.error {
  color: #c8323e;
}

.board-info {
  margin-bottom: 18px;
}

.breadcrumb {
  margin-bottom: 6px;

  color: #666666;
  font-size: 14px;
}

.board-sub {
  color: #888888;
  font-size: 13px;
}

.post-article {
  padding: 30px;

  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.post-title {
  flex: 1;

  margin: 0;

  color: #222222;
  font-size: 28px;
  line-height: 1.4;
}

.bookmark-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 6px;

  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;

  cursor: pointer;
}

.bookmark-btn:hover {
  background: #f7f7f7;
}

.bookmark-btn[aria-pressed='true']
  svg path {
  stroke: #c8323e;
}

.post-meta {
  display: flex;
  gap: 14px;

  margin-top: 12px;
  padding-bottom: 20px;

  color: #777777;
  font-size: 14px;

  border-bottom: 1px solid #eeeeee;
}

.post-content {
  min-height: 280px;
  margin-top: 24px;
}

.post-image {
  display: block;

  max-width: 100%;
  height: auto;
  margin-bottom: 18px;
}

.content-text {
  color: #333333;
  line-height: 1.8;
  white-space: pre-wrap;
}

.post-info {
  margin-top: 30px;
  padding: 18px;

  background: #fafafa;
  border-radius: 7px;
}

.info-row {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 16px;

  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row dt {
  font-weight: 700;
}

.info-row dd {
  margin: 0;

  color: #555555;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 28px;
  padding-top: 20px;

  border-top: 1px solid #eeeeee;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 76px;
  height: 40px;
  padding: 0 14px;

  color: #333333;
  font-size: 14px;
  font-weight: 600;

  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 6px;

  cursor: pointer;
}

.btn:hover {
  background: #f7f7f7;
}

.edit-btn {
  color: #c8323e;
  border-color: #c8323e;
}

.delete-btn {
  color: #ffffff;

  background: #c8323e;
  border-color: #c8323e;
}

.delete-btn:hover {
  background: #c8323e;
}

@media (max-width: 600px) {
  .post-article {
    padding: 22px 18px;
  }

  .post-title {
    font-size: 23px;
  }

  .post-meta {
    flex-direction: column;
    gap: 5px;
  }

  .post-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .footer-left,
  .footer-right {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .btn {
    width: 100%;
  }
}
</style>