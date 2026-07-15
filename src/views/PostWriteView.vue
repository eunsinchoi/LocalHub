<script setup>
import {
  computed,
  reactive,
  ref,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import { categories } from '../constants/categories.js'

const route = useRoute()
const router = useRouter()

const form = reactive({
  title: '',
  content: '',
  password: '',
  passwordConfirm: '',
})

const errors = reactive({
  title: '',
  content: '',
  password: '',
  passwordConfirm: '',
})

const isSubmitting = ref(false)

const currentCategoryKey = computed(() => {
  return (
    route.params.category ||
    'tourist'
  )
})

const currentCategory = computed(() => {
  return (
    categories.find((category) => {
      return (
        getCategoryKey(category) ===
        currentCategoryKey.value
      )
    }) || categories[0]
  )
})

function getCategoryKey(category) {
  return category.path
    .split('/')
    .filter(Boolean)
    .pop()
}

function moveToCategory(category) {
  router.push(category.path)
}

function clearErrors() {
  errors.title = ''
  errors.content = ''
  errors.password = ''
  errors.passwordConfirm = ''
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

  if (!form.password) {
    errors.password =
      '수정용 비밀번호를 입력해주세요.'

    isValid = false
  } else if (
    !/^\d{4,}$/.test(form.password)
  ) {
    errors.password =
      '비밀번호는 숫자 4자리 이상이어야 합니다.'

    isValid = false
  }

  if (!form.passwordConfirm) {
    errors.passwordConfirm =
      '비밀번호를 한 번 더 입력해주세요.'

    isValid = false
  } else if (
    form.password !==
    form.passwordConfirm
  ) {
    errors.passwordConfirm =
      '비밀번호가 일치하지 않습니다.'

    isValid = false
  }

  return isValid
}

function allowNumbersOnly(
  field,
  event,
) {
  form[field] =
    event.target.value.replace(/\D/g, '')
}

async function submitPost() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const postData = {
      category:
        currentCategoryKey.value,
      title: form.title.trim(),
      content: form.content.trim(),
      password: form.password,
    }

    /*
      실제 API 연결 예시

      await createPost(postData)

      또는

      await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(postData),
      })
    */

    console.log(
      '등록할 게시글:',
      postData,
    )

    window.alert(
      '게시글이 등록되었습니다.',
    )

    router.push(
      currentCategory.value.path,
    )
  } catch (error) {
    console.error(
      '게시글 등록 실패:',
      error,
    )

    window.alert(
      '게시글 등록 중 오류가 발생했습니다.',
    )
  } finally {
    isSubmitting.value = false
  }
}

function cancelWrite() {
  const hasInput =
    form.title.trim() ||
    form.content.trim() ||
    form.password ||
    form.passwordConfirm

  if (
    hasInput &&
    !window.confirm(
      '작성 중인 내용이 사라집니다. 취소하시겠습니까?',
    )
  ) {
    return
  }

  router.push(
    currentCategory.value.path,
  )
}
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
              currentCategoryKey,
          }"
          @click="
            moveToCategory(category)
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

        <span
          class="breadcrumb-divider"
        >
          &gt;
        </span>

        <RouterLink
          :to="
            currentCategory.path
          "
          class="breadcrumb-link"
        >
          {{
            currentCategory.name
          }}
        </RouterLink>

        <span
          class="breadcrumb-divider"
        >
          &gt;
        </span>

        <span
          class="breadcrumb-current"
        >
          글쓰기
        </span>
      </div>

      <section class="write-section">
        <div class="section-header">
          <div>
            <span
              class="category-badge"
            >
              {{
                currentCategory.name
              }}
            </span>

            <h1 class="page-title">
              게시글 작성
            </h1>
          </div>

          <p class="required-guide">
            <span>*</span>
            필수 입력 항목
          </p>
        </div>

        <form
          class="write-form"
          @submit.prevent="
            submitPost
          "
        >
          <!-- 제목 -->
          <div class="form-row">
            <label
              for="post-title"
              class="form-label"
            >
              제목
              <span
                class="required-mark"
              >
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
                  error:
                    errors.title,
                }"
                maxlength="100"
                placeholder="제목을 입력해주세요"
              />

              <div
                class="field-information"
              >
                <p
                  v-if="
                    errors.title
                  "
                  class="error-message"
                >
                  {{ errors.title }}
                </p>

                <span
                  class="character-count"
                >
                  {{
                    form.title.length
                  }}
                  / 100
                </span>
              </div>
            </div>
          </div>

          <!-- 내용 -->
          <div
            class="form-row content-row"
          >
            <label
              for="post-content"
              class="form-label"
            >
              내용
              <span
                class="required-mark"
              >
                *
              </span>
            </label>

            <div class="form-field">
              <textarea
                id="post-content"
                v-model="
                  form.content
                "
                class="form-textarea"
                :class="{
                  error:
                    errors.content,
                }"
                maxlength="3000"
                placeholder="내용을 입력해주세요"
              ></textarea>

              <div
                class="field-information"
              >
                <p
                  v-if="
                    errors.content
                  "
                  class="error-message"
                >
                  {{
                    errors.content
                  }}
                </p>

                <span
                  class="character-count"
                >
                  {{
                    form.content
                      .length
                  }}
                  / 3000
                </span>
              </div>
            </div>
          </div>

          <!-- 수정용 비밀번호 -->
          <div class="form-row">
            <label
              for="post-password"
              class="form-label"
            >
              수정용 비밀번호
              <span
                class="required-mark"
              >
                *
              </span>
            </label>

            <div
              class="form-field password-field"
            >
              <input
                id="post-password"
                :value="
                  form.password
                "
                type="password"
                inputmode="numeric"
                autocomplete="new-password"
                maxlength="20"
                class="form-input password-input"
                :class="{
                  error:
                    errors.password,
                }"
                placeholder="숫자 4자리 이상 입력해주세요"
                @input="
                  allowNumbersOnly(
                    'password',
                    $event,
                  )
                "
              />

              <p
                class="password-guide"
              >
                게시글 수정 및 삭제
                시 사용됩니다.
              </p>

              <p
                v-if="
                  errors.password
                "
                class="error-message"
              >
                {{
                  errors.password
                }}
              </p>
            </div>
          </div>

          <!-- 비밀번호 확인 -->
          <div class="form-row">
            <label
              for="post-password-confirm"
              class="form-label"
            >
              비밀번호 확인
              <span
                class="required-mark"
              >
                *
              </span>
            </label>

            <div
              class="form-field password-field"
            >
              <input
                id="post-password-confirm"
                :value="
                  form.passwordConfirm
                "
                type="password"
                inputmode="numeric"
                autocomplete="new-password"
                maxlength="20"
                class="form-input password-input"
                :class="{
                  error:
                    errors.passwordConfirm,
                }"
                placeholder="비밀번호를 다시 입력해주세요"
                @input="
                  allowNumbersOnly(
                    'passwordConfirm',
                    $event,
                  )
                "
              />

              <p
                v-if="
                  errors.passwordConfirm
                "
                class="error-message"
              >
                {{
                  errors.passwordConfirm
                }}
              </p>
            </div>
          </div>

          <!-- 버튼 -->
          <div class="button-area">
            <button
              type="button"
              class="cancel-button"
              :disabled="
                isSubmitting
              "
              @click="cancelWrite"
            >
              취소
            </button>

            <button
              type="submit"
              class="submit-button"
              :disabled="
                isSubmitting
              "
            >
              {{
                isSubmitting
                  ? '등록 중...'
                  : '등록'
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
  min-height:
    calc(100vh - 72px);
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

  border-bottom:
    1px solid #e8e8e8;
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
  border:
    1px solid #dddddd;
  border-radius: 6px;

  cursor: pointer;

  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.category-button:hover {
  color: #c53030;
  border-color: #c53030;
}

.category-button.active {
  color: #ffffff;

  background: #c53030;
  border-color: #c53030;
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
  color: #c53030;
  text-decoration: underline;
}

.breadcrumb-divider {
  color: #bbbbbb;
}

.breadcrumb-current {
  color: #333333;
  font-weight: 600;
}

/* 작성 영역 */

.write-section {
  padding: 34px 38px 30px;

  background: #ffffff;
  border:
    1px solid #dddddd;
  border-radius: 10px;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content:
    space-between;

  margin-bottom: 30px;
  padding-bottom: 22px;

  border-bottom:
    2px solid #222222;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 68px;
  height: 28px;
  margin-bottom: 10px;
  padding: 0 12px;

  color: #c53030;
  font-size: 13px;
  font-weight: 700;

  background: #fff5f5;
  border:
    1px solid #c53030;
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
  color: #c53030;
}

/* 폼 */

.form-row {
  display: grid;
  grid-template-columns:
    150px minmax(0, 1fr);
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
  border:
    1px solid #dddddd;
  border-radius: 5px;
  outline: none;

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
  border-color: #c53030;
  box-shadow:
    0 0 0 3px
    rgba(197, 48, 48, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #d92d20;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #aaaaaa;
}

.field-information {
  display: flex;
  align-items: center;
  justify-content:
    space-between;

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

  color: #d92d20;
  font-size: 12px;
}

.field-information
  .error-message {
  margin: 0;
}

.password-field {
  max-width: 500px;
}

.password-input {
  max-width: 360px;
}

.password-guide {
  margin: 7px 0 0;

  color: #888888;
  font-size: 12px;
}

/* 버튼 */

.button-area {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  margin-top: 26px;
  padding-top: 24px;

  border-top:
    1px solid #eeeeee;
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
  border:
    1px solid #cccccc;
}

.cancel-button:hover {
  background: #f5f5f5;
}

.submit-button {
  color: #ffffff;

  background: #c53030;
  border:
    1px solid #c53030;
}

.submit-button:hover {
  background: #a92727;
  border-color: #a92727;
}

.cancel-button:disabled,
.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

/* 반응형 */

@media (max-width: 768px) {
  .post-write-view {
    padding:
      24px 16px 50px;
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

  .password-field,
  .password-input {
    max-width: none;
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
    grid-template-columns:
      1fr 1fr;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}
</style>