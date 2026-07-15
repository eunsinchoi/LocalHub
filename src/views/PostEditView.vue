<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  categories,
} from '../constants/categories.js'

import {
  getPostById,
  updatePost,
} from '../services/postStorageService.js'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const selectedCategoryKey = ref('tourist')

const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref('')

const form = reactive({
  title: '',
  content: '',
})

const initialForm = ref({
  title: '',
  content: '',
  categoryKey: '',
})

const errors = reactive({
  title: '',
  content: '',
})

const postId = computed(() => {
  return String(
    route.params.id || '',
  )
})

const authorizationKey = computed(() => {
  return (
    `localhub_edit_authorized:` +
    postId.value
  )
})

const currentCategory = computed(() => {
  return (
    categories.find((category) => {
      return (
        getCategoryKey(category) ===
        selectedCategoryKey.value
      )
    }) || categories[0]
  )
})

const hasChanges = computed(() => {
  return (
    form.title.trim() !==
      initialForm.value.title ||
    form.content.trim() !==
      initialForm.value.content ||
    selectedCategoryKey.value !==
      initialForm.value.categoryKey
  )
})

function getCategoryKey(category) {
  return category.path
    .split('/')
    .filter(Boolean)
    .pop()
}

function selectCategory(category) {
  selectedCategoryKey.value =
    getCategoryKey(category)
}

function clearErrors() {
  errors.title = ''
  errors.content = ''
}

function validateForm() {
  clearErrors()

  let isValid = true

  if (!form.title.trim()) {
    errors.title =
      '제목을 입력해주세요.'

    isValid = false
  }

  if (!form.content.trim()) {
    errors.content =
      '내용을 입력해주세요.'

    isValid = false
  }

  return isValid
}

function clearEditAuthorization() {
  if (!postId.value) {
    return
  }

  sessionStorage.removeItem(
    authorizationKey.value,
  )
}

function moveToDetail() {
  router.push({
    name: 'post-detail',

    params: {
      id: postId.value,
    },

    query: {
      source: 'user',
    },
  })
}

function loadPost() {
  isLoading.value = true
  error.value = ''

  try {
    const isAuthorized =
      sessionStorage.getItem(
        authorizationKey.value,
      ) === 'true'

    if (!isAuthorized) {
      window.alert(
        '비밀번호 확인 후 수정할 수 있습니다.',
      )

      moveToDetail()
      return
    }

    const savedPost =
      getPostById(postId.value)

    if (!savedPost) {
      error.value =
        '수정할 게시글을 찾을 수 없습니다.'

      return
    }

    if (savedPost.source !== 'user') {
      error.value =
        '사용자가 작성한 게시글만 수정할 수 있습니다.'

      return
    }

    post.value = savedPost

    const categoryKey =
      savedPost.categoryKey ||
      String(
        route.params.category ||
        'tourist',
      )

    selectedCategoryKey.value =
      categoryKey

    form.title =
      savedPost.title || ''

    form.content =
      savedPost.content || ''

    initialForm.value = {
      title:
        form.title.trim(),

      content:
        form.content.trim(),

      categoryKey,
    }
  } catch (loadError) {
    console.error(
      '게시글 수정 정보 로드 실패:',
      loadError,
    )

    error.value =
      '게시글 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

function submitEdit() {
  if (!validateForm()) {
    return
  }

  if (!post.value) {
    return
  }

  isSubmitting.value = true

  try {
    const updatedPost =
      updatePost(
        postId.value,
        {
          categoryKey:
            selectedCategoryKey.value,

          category:
            currentCategory.value.name,

          contentType:
            currentCategory.value.name,

          title:
            form.title.trim(),

          content:
            form.content.trim(),
        },
      )

    if (!updatedPost) {
      throw new Error(
        '게시글을 수정하지 못했습니다.',
      )
    }

    /*
     * 편집 권한은 한 번 사용한 뒤 제거합니다.
     */
    clearEditAuthorization()

    window.alert(
      '게시글이 수정되었습니다.',
    )

    router.push({
      name: 'post-detail',

      params: {
        id: postId.value,
      },

      query: {
        source: 'user',
      },
    })
  } catch (submitError) {
    console.error(
      '게시글 수정 실패:',
      submitError,
    )

    window.alert(
      '게시글 수정 중 오류가 발생했습니다.',
    )
  } finally {
    isSubmitting.value = false
  }
}

function cancelEdit() {
  if (
    hasChanges.value &&
    !window.confirm(
      '수정한 내용이 사라집니다. 취소하시겠습니까?',
    )
  ) {
    return
  }

  clearEditAuthorization()
  moveToDetail()
}

onMounted(loadPost)

onBeforeUnmount(() => {
  /*
   * 제출이나 취소가 아닌 브라우저 뒤로가기로
   * 화면을 벗어나도 인증 상태를 제거합니다.
   */
  clearEditAuthorization()
})
</script>

<template>
  <main class="post-write-view">
    <div class="write-container">
      <!-- 카테고리 메뉴 -->
      <nav
        class="category-navigation"
        aria-label="게시판 카테고리"
      >
        <button
          v-for="category in categories"
          :key="category.path"
          type="button"
          class="category-button"
          :class="{
            active:
              getCategoryKey(category) ===
              selectedCategoryKey,
          }"
          :disabled="
            isLoading ||
            isSubmitting
          "
          @click="
            selectCategory(category)
          "
        >
          {{ category.name }}
        </button>
      </nav>

      <!-- 경로 표시 -->
      <div class="breadcrumb">
        <RouterLink
          to="/"
          class="breadcrumb-link"
        >
          홈
        </RouterLink>

        <span class="breadcrumb-divider">
          &gt;
        </span>

        <RouterLink
          :to="currentCategory.path"
          class="breadcrumb-link"
        >
          {{ currentCategory.name }}
        </RouterLink>

        <span class="breadcrumb-divider">
          &gt;
        </span>

        <span class="breadcrumb-current">
          게시글 수정
        </span>
      </div>

      <!-- 로딩 -->
      <section
        v-if="isLoading"
        class="write-section state-section"
      >
        게시글을 불러오는 중입니다.
      </section>

      <!-- 오류 -->
      <section
        v-else-if="error"
        class="write-section state-section error-state"
      >
        <p>{{ error }}</p>

        <button
          type="button"
          class="cancel-button"
          @click="moveToDetail"
        >
          상세 화면으로
        </button>
      </section>

      <!-- 수정 폼 -->
      <section
        v-else
        class="write-section"
      >
        <div class="section-header">
          <div>
            <span class="category-badge">
              {{ currentCategory.name }}
            </span>

            <h1 class="page-title">
              게시글 수정
            </h1>
          </div>

          <p class="required-guide">
            <span>*</span>
            필수 입력 항목
          </p>
        </div>

        <form
          class="write-form"
          @submit.prevent="submitEdit"
        >
          <!-- 제목 -->
          <div class="form-row">
            <label
              for="post-title"
              class="form-label"
            >
              제목

              <span class="required-mark">
                *
              </span>
            </label>

            <div class="form-field">
              <input
                id="post-title"
                v-model="form.title"
                type="text"
                class="form-input"
                :class="{
                  error: errors.title,
                }"
                maxlength="100"
                placeholder="제목을 입력해주세요"
              />

              <div class="field-information">
                <p
                  v-if="errors.title"
                  class="error-message"
                >
                  {{ errors.title }}
                </p>

                <span class="character-count">
                  {{ form.title.length }}
                  / 100
                </span>
              </div>
            </div>
          </div>

          <!-- 내용 -->
          <div class="form-row content-row">
            <label
              for="post-content"
              class="form-label"
            >
              내용

              <span class="required-mark">
                *
              </span>
            </label>

            <div class="form-field">
              <textarea
                id="post-content"
                v-model="form.content"
                class="form-textarea"
                :class="{
                  error: errors.content,
                }"
                maxlength="3000"
                placeholder="내용을 입력해주세요"
              ></textarea>

              <div class="field-information">
                <p
                  v-if="errors.content"
                  class="error-message"
                >
                  {{ errors.content }}
                </p>

                <span class="character-count">
                  {{ form.content.length }}
                  / 3000
                </span>
              </div>
            </div>
          </div>

          <!-- 버튼 -->
          <div class="button-area">
            <button
              type="button"
              class="cancel-button"
              :disabled="isSubmitting"
              @click="cancelEdit"
            >
              취소
            </button>

            <button
              type="submit"
              class="submit-button"
              :disabled="
                isSubmitting ||
                !hasChanges
              "
            >
              {{
                isSubmitting
                  ? '수정 중...'
                  : '수정'
              }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<style scoped>
.post-write-view {
  min-height: calc(100vh - 72px);
  padding: 34px 24px 70px;
  background: #ffffff;
}

.write-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

/* 카테고리 */

.category-navigation {
  display: flex;
  align-items: center;
  gap: 8px;

  margin-bottom: 28px;
  padding-bottom: 14px;

  overflow-x: auto;

  border-bottom: 1px solid #e8e8e8;
}

.category-button {
  flex: 0 0 auto;

  min-width: 84px;
  height: 38px;
  padding: 0 16px;

  color: #555555;
  font-size: 14px;
  font-weight: 600;

  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 6px;

  cursor: pointer;

  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.category-button:hover {
  color: #c8323e;
  border-color: #c8323e;
}

.category-button.active {
  color: #ffffff;
  background: #c8323e;
  border-color: #c8323e;
}

.category-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

/* 경로 */

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;

  margin-bottom: 18px;

  color: #888888;
  font-size: 13px;
}

.breadcrumb-link {
  color: #777777;
  text-decoration: none;
}

.breadcrumb-link:hover {
  color: #c8323e;
  text-decoration: underline;
}

.breadcrumb-divider {
  color: #bbbbbb;
}

.breadcrumb-current {
  color: #333333;
  font-weight: 600;
}

/* 수정 영역 */

.write-section {
  padding: 34px 38px 30px;

  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 10px;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  margin-bottom: 30px;
  padding-bottom: 22px;

  border-bottom: 2px solid #222222;
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
}

.page-title {
  margin: 0;

  color: #202020;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -0.7px;
}

.required-guide {
  margin: 0;

  color: #888888;
  font-size: 12px;
}

.required-guide span,
.required-mark {
  color: #c8323e;
}

/* 폼 */

.form-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 24px;

  padding: 18px 0;
}

.form-label {
  padding-top: 13px;

  color: #222222;
  font-size: 14px;
  font-weight: 700;
}

.form-field {
  min-width: 0;
}

.form-input,
.form-textarea {
  width: 100%;

  color: #222222;
  font-family: inherit;
  font-size: 14px;

  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 5px;
  outline: none;

  box-sizing: border-box;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-input {
  height: 46px;
  padding: 0 14px;
}

.form-textarea {
  min-height: 280px;
  padding: 15px;

  line-height: 1.7;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #c8323e;

  box-shadow:
    0 0 0 3px
    rgba(197, 48, 48, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #c8323e;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #aaaaaa;
}

.field-information {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 23px;
  margin-top: 6px;
}

.character-count {
  margin-left: auto;

  color: #999999;
  font-size: 12px;
}

.error-message {
  margin: 7px 0 0;

  color: #c8323e;
  font-size: 12px;
}

.field-information .error-message {
  margin: 0;
}

/* 버튼 */

.button-area {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  margin-top: 26px;
  padding-top: 24px;

  border-top: 1px solid #eeeeee;
}

.cancel-button,
.submit-button {
  min-width: 86px;
  height: 42px;
  padding: 0 20px;

  font-size: 14px;
  font-weight: 700;

  border-radius: 5px;
  cursor: pointer;
}

.cancel-button {
  color: #555555;

  background: #ffffff;
  border: 1px solid #cccccc;
}

.cancel-button:hover {
  background: #f5f5f5;
}

.submit-button {
  color: #ffffff;

  background: #c8323e;
  border: 1px solid #c8323e;
}

.submit-button:hover {
  background: #b42b36;
  border-color: #b42b36;
}

.cancel-button:disabled,
.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

/* 상태 */

.state-section {
  padding: 70px 20px;

  color: #777777;
  text-align: center;
}

.state-section p {
  margin: 0 0 20px;
}

.error-state {
  color: #c8323e;
}

/* 반응형 */

@media (max-width: 768px) {
  .post-write-view {
    padding: 24px 16px 50px;
  }

  .write-section {
    padding: 26px 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 9px;

    padding: 14px 0;
  }

  .form-label {
    padding-top: 0;
  }

  .form-textarea {
    min-height: 230px;
  }

  .required-guide {
    display: none;
  }
}

@media (max-width: 480px) {
  .write-section {
    padding: 22px 16px;
  }

  .page-title {
    font-size: 23px;
  }

  .button-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}
</style>