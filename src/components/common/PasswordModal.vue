<script setup>
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: '비밀번호 확인',
  },

  description: {
    type: String,
    default:
      '게시글 작성 시 설정한 비밀번호를 입력해주세요.',
  },

  confirmText: {
    type: String,
    default: '확인',
  },

  isLoading: {
    type: Boolean,
    default: false,
  },

  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'close',
  'confirm',
])

const password = ref('')
const validationMessage = ref('')
const passwordInput = ref(null)

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (!isOpen) {
      password.value = ''
      validationMessage.value = ''
      return
    }

    await nextTick()
    passwordInput.value?.focus()
  },
)

function allowNumbersOnly(event) {
  password.value =
    event.target.value.replace(/\D/g, '')
}

function submitPassword() {
  validationMessage.value = ''

  if (!password.value) {
    validationMessage.value =
      '비밀번호를 입력해주세요.'

    passwordInput.value?.focus()
    return
  }

  if (!/^\d{4,}$/.test(password.value)) {
    validationMessage.value =
      '비밀번호는 숫자 4자리 이상이어야 합니다.'

    passwordInput.value?.focus()
    return
  }

  emit('confirm', password.value)
}

function closeModal() {
  if (props.isLoading) {
    return
  }

  emit('close')
}

function handleKeydown(event) {
  if (
    event.key === 'Escape' &&
    props.isOpen
  ) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener(
    'keydown',
    handleKeydown,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'keydown',
    handleKeydown,
  )
})
</script>

<template>
  <Teleport to="body">
    <Transition name="password-modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <section
          class="password-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
        >
          <div class="modal-header">
            <div>
              <h2
                id="password-modal-title"
                class="modal-title"
              >
                {{ title }}
              </h2>

              <p class="modal-description">
                {{ description }}
              </p>
            </div>

            <button
              type="button"
              class="close-button"
              aria-label="비밀번호 확인창 닫기"
              :disabled="isLoading"
              @click="closeModal"
            >
              ×
            </button>
          </div>

          <form
            class="password-form"
            @submit.prevent="submitPassword"
          >
            <label
              for="password-modal-input"
              class="input-label"
            >
              수정용 비밀번호
            </label>

            <input
              id="password-modal-input"
              ref="passwordInput"
              :value="password"
              type="password"
              inputmode="numeric"
              autocomplete="current-password"
              maxlength="20"
              class="password-input"
              :class="{
                error:
                  validationMessage ||
                  errorMessage,
              }"
              placeholder="숫자 4자리 이상 입력해주세요"
              :disabled="isLoading"
              @input="allowNumbersOnly"
            />

            <p
              v-if="
                validationMessage ||
                errorMessage
              "
              class="error-message"
            >
              {{
                validationMessage ||
                errorMessage
              }}
            </p>

            <div class="button-area">
              <button
                type="button"
                class="cancel-button"
                :disabled="isLoading"
                @click="closeModal"
              >
                취소
              </button>

              <button
                type="submit"
                class="confirm-button"
                :disabled="isLoading"
              >
                {{
                  isLoading
                    ? '확인 중...'
                    : confirmText
                }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(0, 0, 0, 0.42);
}

.password-modal {
  width: 100%;
  max-width: 430px;
  padding: 26px;

  background: #ffffff;
  border-radius: 14px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.22);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 24px;
}

.modal-title {
  margin: 0;

  color: #222222;
  font-size: 21px;
  font-weight: 700;
}

.modal-description {
  margin: 8px 0 0;

  color: #777777;
  font-size: 13px;
  line-height: 1.6;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;

  width: 34px;
  height: 34px;
  padding: 0;

  color: #777777;
  font-size: 26px;
  line-height: 1;

  background: transparent;
  border: none;
  border-radius: 50%;

  cursor: pointer;
}

.close-button:hover {
  color: #c53030;
  background: #f5f5f5;
}

.password-form {
  width: 100%;
}

.input-label {
  display: block;

  margin-bottom: 8px;

  color: #333333;
  font-size: 14px;
  font-weight: 700;
}

.password-input {
  width: 100%;
  height: 48px;
  padding: 0 14px;

  color: #222222;
  font-family: inherit;
  font-size: 15px;

  background: #ffffff;
  border: 1px solid #d8d8d8;
  border-radius: 7px;
  outline: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.password-input:focus {
  border-color: #c53030;
  box-shadow:
    0 0 0 3px
    rgba(197, 48, 48, 0.1);
}

.password-input.error {
  border-color: #d92d20;
}

.password-input::placeholder {
  color: #aaaaaa;
}

.error-message {
  margin: 8px 0 0;

  color: #d92d20;
  font-size: 12px;
}

.button-area {
  display: flex;
  justify-content: flex-end;
  gap: 9px;

  margin-top: 26px;
}

.cancel-button,
.confirm-button {
  min-width: 82px;
  height: 40px;
  padding: 0 18px;

  font-size: 14px;
  font-weight: 700;

  border-radius: 6px;
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

.confirm-button {
  color: #ffffff;

  background: #c53030;
  border: 1px solid #c53030;
}

.confirm-button:hover {
  background: #a92727;
  border-color: #a92727;
}

button:disabled,
input:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.password-modal-enter-active,
.password-modal-leave-active {
  transition: opacity 0.2s ease;
}

.password-modal-enter-active
  .password-modal,
.password-modal-leave-active
  .password-modal {
  transition: transform 0.2s ease;
}

.password-modal-enter-from,
.password-modal-leave-to {
  opacity: 0;
}

.password-modal-enter-from
  .password-modal,
.password-modal-leave-to
  .password-modal {
  transform: translateY(-18px)
    scale(0.98);
}

@media (max-width: 480px) {
  .password-modal {
    padding: 22px 18px;
  }

  .button-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .cancel-button,
  .confirm-button {
    width: 100%;
  }
}
</style>