<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import PasswordModal from '../components/common/PasswordModal.vue'
import CommentSection from '../components/board/CommentSection.vue'

import {
  deletePost,
} from '../services/postStorageService.js'

import {
  findContentById,
} from '../services/contentFeedService.js'

import {
  isBookmarked as checkBookmarked,
  toggleBookmark as updateBookmark,
} from '../services/bookmarkService.js'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const isLoading = ref(true)
const error = ref('')

const isBookmarked = ref(false)
const showPasswordModal = ref(false)
const pendingAction = ref('')

const postId = computed(() => {
  return String(
    route.params.id || '',
  )
})

const postSource = computed(() => {
  return String(
    route.query.source || '',
  )
})

const isUserPost = computed(() => {
  return (
    post.value?.source === 'user'
  )
})

const bookmarkKey = computed(() => {
  if (!post.value) {
    return ''
  }

  return (
    post.value.feedId ||
    `${post.value.source}:${post.value.id}`
  )
})

const commentPostId = computed(() => {
  return (
    post.value?.feedId ||
    postId.value
  )
})

const boardCrumb = computed(() => {
  const category =
    post.value?.category ||
    '관광지'

  return `홈 > ${category} > 게시글`
})

const displayAuthor = computed(() => {
  if (!post.value) {
    return '익명'
  }

  if (
    post.value.source === 'local'
  ) {
    return '한국관광공사'
  }

  return (
    post.value.nickname ||
    post.value.author ||
    post.value.raw?.nickname ||
    post.value.raw?.author ||
    '익명'
  )
})

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const stringValue =
    String(value)

  if (/^\d{8}/.test(stringValue)) {
    return [
      stringValue.slice(0, 4),
      stringValue.slice(4, 6),
      stringValue.slice(6, 8),
    ].join('-')
  }

  return stringValue.slice(0, 10)
}

async function loadPost() {
  isLoading.value = true
  error.value = ''
  post.value = null

  if (!postId.value) {
    error.value =
      '잘못된 게시글입니다.'

    isLoading.value = false
    return
  }

  try {
    post.value =
      await findContentById(
        postId.value,
        postSource.value,
      )

    if (!post.value) {
      error.value =
        '게시글을 찾을 수 없습니다.'

      return
    }

    isBookmarked.value =
      checkBookmarked(
        bookmarkKey.value,
      )
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
  if (!bookmarkKey.value) {
    return
  }

  isBookmarked.value =
    updateBookmark(
      bookmarkKey.value,
    )
}

function goBackToList() {
  const categoryKey =
    post.value?.categoryKey ||
    route.params.category ||
    'tourist'

  router.push(
    `/board/${categoryKey}`,
  )
}

function requestEdit() {
  if (!isUserPost.value) {
    return
  }

  pendingAction.value = 'edit'
  showPasswordModal.value = true
}

function requestDelete() {
  if (!isUserPost.value) {
    return
  }

  pendingAction.value = 'delete'
  showPasswordModal.value = true
}

function closePasswordModal() {
  showPasswordModal.value = false
  pendingAction.value = ''
}

/*
 * PasswordModal에서 문자열 또는 객체 형태로
 * 비밀번호가 전달되는 경우를 모두 처리합니다.
 */
function normalizePasswordInput(payload) {
  if (
    typeof payload === 'string' ||
    typeof payload === 'number'
  ) {
    return String(payload).trim()
  }

  if (
    payload &&
    typeof payload === 'object'
  ) {
    return String(
      payload.password ??
      payload.value ??
      payload.target?.value ??
      '',
    ).trim()
  }

  return ''
}

function confirmPassword(payload) {
  if (!isUserPost.value) {
    closePasswordModal()
    return
  }

  const enteredPassword =
    normalizePasswordInput(payload)

  /*
   * 현재 정규화된 게시물 또는 raw 원본에서
   * 작성 시 저장한 비밀번호를 확인합니다.
   */
  const savedPassword =
    String(
      post.value?.password ??
      post.value?.raw?.password ??
      '',
    ).trim()

  if (
    !enteredPassword ||
    !savedPassword ||
    enteredPassword !== savedPassword
  ) {
    window.alert(
      '비밀번호가 일치하지 않습니다.',
    )

    return
  }

  /*
   * 수정 버튼을 통해 들어온 경우
   */
  if (
    pendingAction.value === 'edit'
  ) {
    const categoryKey =
      post.value?.categoryKey ||
      'tourist'

    /*
     * 편집 화면에서 직접 주소를 입력해 접근하는 것을
     * 방지하기 위한 임시 인증 값입니다.
     */
    sessionStorage.setItem(
      `localhub_edit_authorized:${postId.value}`,
      'true',
    )

    closePasswordModal()

    router.push(
      `/board/${categoryKey}/edit/${postId.value}`,
    )

    return
  }

  /*
   * 삭제 버튼을 통해 들어온 경우
   *
   * 기존 삭제 흐름을 그대로 유지합니다.
   */
  if (
    pendingAction.value === 'delete'
  ) {
    const shouldDelete =
      window.confirm(
        '정말로 게시글을 삭제하시겠습니까?',
      )

    if (!shouldDelete) {
      return
    }

    const deleted =
      deletePost(postId.value)

    if (!deleted) {
      window.alert(
        '게시글을 삭제하지 못했습니다.',
      )

      return
    }

    closePasswordModal()

    window.alert(
      '게시글이 삭제되었습니다.',
    )

    goBackToList()
  }
}

async function sharePost() {
  const shareData = {
    title:
      post.value?.title ||
      '게시글',

    text:
      post.value?.content
        ?.slice(0, 120) ||
      '',

    url:
      window.location.href,
  }

  if (navigator.share) {
    try {
      await navigator.share(
        shareData,
      )
    } catch {
      /*
       * 사용자가 공유 창을 닫은 경우에는
       * 별도 오류 메시지를 표시하지 않습니다.
       */
    }

    return
  }

  try {
    await navigator.clipboard
      ?.writeText(
        window.location.href,
      )

    window.alert(
      '주소가 클립보드에 복사되었습니다.',
    )
  } catch (clipboardError) {
    console.error(
      '주소 복사 실패:',
      clipboardError,
    )

    window.alert(
      '주소를 복사하지 못했습니다.',
    )
  }
}

watch(
  [
    () => route.params.id,
    () => route.query.source,
  ],
  loadPost,
  {
    immediate: true,
  },
)
</script>

<template>
  <main class="post-detail-view">
    <!-- 로딩 상태 -->
    <div
      v-if="isLoading"
      class="state"
    >
      게시글을 불러오는 중입니다...
    </div>

    <!-- 오류 상태 -->
    <div
      v-else-if="error"
      class="state error"
    >
      <p>{{ error }}</p>

      <button
        type="button"
        class="btn list-btn"
        @click="goBackToList"
      >
        목록으로
      </button>
    </div>

    <!-- 게시글 상세 -->
    <template v-else-if="post">
      <!-- 게시판 경로 -->
      <section class="board-info">
        <div class="breadcrumb">
          {{ boardCrumb }}
        </div>

        <div class="board-sub">
          {{
            post.source === 'local'
              ? '서울 지역 정보 상세'
              : '커뮤니티 게시글 상세'
          }}
        </div>
      </section>

      <article class="post-article">
        <!-- 제목 영역 -->
        <header class="post-header">
          <div class="post-heading">
            <span
              v-if="post.category"
              class="category-badge"
            >
              {{ post.category }}
            </span>

            <h1 class="post-title">
              {{ post.title || '제목 없음' }}
            </h1>
          </div>

          <!-- 북마크 -->
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
                :stroke="
                  isBookmarked
                    ? '#c8323e'
                    : '#333333'
                "
                stroke-width="1.2"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </header>

        <!-- 작성 정보 -->
        <div class="post-meta">
          <span class="author">
            작성자:
            {{ displayAuthor }}
          </span>

          <span class="date">
            {{
              post.modifiedAt &&
              post.modifiedAt !== post.createdAt
                ? '수정일'
                : '작성일'
            }}:

            {{
              formatDate(
                post.modifiedAt ||
                post.createdAt,
              )
            }}
          </span>

          <span
            v-if="post.source === 'local'"
            class="source"
          >
            출처: 한국관광공사 TourAPI
          </span>
        </div>

        <!-- 본문 -->
        <section class="post-content">
          <!-- 대표 이미지 -->
          <img
            v-if="post.image"
            :src="post.image"
            :alt="post.title || '게시글 이미지'"
            class="post-image"
          />

          <!-- 사용자 게시글 내용 -->
          <div
            v-if="post.content"
            class="content-text"
          >
            {{ post.content }}
          </div>

          <!-- JSON 데이터 본문 -->
          <div
            v-else-if="post.raw?.overview"
            class="content-text"
          >
            {{ post.raw.overview }}
          </div>

          <div
            v-else-if="
              post.source === 'local'
            "
            class="content-text"
          >
            서울 지역의
            {{ post.category }} 정보입니다.
          </div>

          <!-- 장소 상세 정보 -->
          <dl
            v-if="
              post.address ||
              post.telephone ||
              post.zipcode
            "
            class="post-info"
          >
            <div
              v-if="post.address"
              class="info-row"
            >
              <dt>주소</dt>

              <dd>
                {{ post.address }}
              </dd>
            </div>

            <div
              v-if="post.zipcode"
              class="info-row"
            >
              <dt>우편번호</dt>

              <dd>
                {{ post.zipcode }}
              </dd>
            </div>

            <div
              v-if="post.telephone"
              class="info-row"
            >
              <dt>전화</dt>

              <dd>
                {{ post.telephone }}
              </dd>
            </div>
          </dl>

          <!-- 사용자 게시물 태그 -->
          <div
            v-if="
              post.source === 'user' &&
              post.tagList?.length
            "
            class="post-tags"
          >
            <span
              v-for="tag in post.tagList"
              :key="tag"
              class="post-tag"
            >
              #{{ tag }}
            </span>
          </div>
        </section>

        <!-- 하단 버튼 -->
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

          <!-- 사용자 작성 게시물에만 표시 -->
          <div
            v-if="isUserPost"
            class="footer-right"
          >
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

      <!-- 댓글 -->
      <CommentSection
        :post-id="commentPostId"
      />
    </template>

    <!-- 수정·삭제 비밀번호 확인 -->
    <PasswordModal
      v-if="isUserPost"
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

  box-sizing: border-box;
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

  box-sizing: border-box;
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.post-heading {
  flex: 1;
  min-width: 0;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 68px;
  height: 28px;
  margin-bottom: 10px;
  padding: 0 12px;

  color: #c8323e;
  font-size: 13px;
  font-weight: 700;

  background: #fff5f5;
  border: 1px solid #c8323e;
  border-radius: 5px;

  box-sizing: border-box;
}

.post-title {
  margin: 0;

  color: #222222;
  font-size: 28px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.bookmark-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

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
  flex-wrap: wrap;
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

  border-radius: 6px;
}

.content-text {
  color: #333333;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
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
  min-width: 0;
  margin: 0;

  color: #555555;
  overflow-wrap: anywhere;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  margin-top: 24px;
}

.post-tag {
  padding: 5px 9px;

  color: #c8323e;
  font-size: 12px;
  font-weight: 600;

  background: #fff5f5;
  border-radius: 4px;
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
  background: #b42b36;
  border-color: #b42b36;
}

@media (max-width: 600px) {
  .post-detail-view {
    padding: 24px 16px 50px;
  }

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

  .info-row {
    grid-template-columns: 1fr;
    gap: 4px;
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