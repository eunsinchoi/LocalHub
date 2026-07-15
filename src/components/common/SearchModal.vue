<script setup>
import { nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const router = useRouter()

const searchKeyword = ref('')
const searchInput = ref(null)

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await nextTick()
      searchInput.value?.focus()
    }
  },
)

function closeModal() {
  emit('close')
}

function submitSearch() {
  const keyword = searchKeyword.value.trim()

  if (!keyword) {
    searchInput.value?.focus()
    return
  }

  router.push({
    path: '/search',
    query: {
      keyword,
    },
  })

  closeModal()
}

function clearKeyword() {
  searchKeyword.value = ''
  searchInput.value?.focus()
}

function handleEscape(event) {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div
        v-if="isOpen"
        class="search-overlay"
        @click.self="closeModal"
      >
        <section
          class="search-modal"
          role="dialog"
          aria-modal="true"
          aria-label="통합 검색"
        >
          <div class="modal-header">
            <h2 class="modal-title">
              통합 검색
            </h2>

            <button
              type="button"
              class="close-button"
              aria-label="검색창 닫기"
              @click="closeModal"
            >
              ×
            </button>
          </div>

          <form
            class="search-form"
            role="search"
            @submit.prevent="submitSearch"
          >
            <div class="search-input-wrapper">
              <svg
                class="search-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="M20 20L16 16" />
              </svg>

              <input
                ref="searchInput"
                v-model="searchKeyword"
                type="search"
                class="search-input"
                placeholder="서울 지역 정보를 검색해보세요"
                aria-label="검색어 입력"
              />

              <button
                v-if="searchKeyword"
                type="button"
                class="clear-button"
                aria-label="검색어 지우기"
                @click="clearKeyword"
              >
                ×
              </button>
            </div>

            <button
              type="submit"
              class="search-submit-button"
            >
              검색
            </button>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;

  display: flex;
  align-items: flex-start;
  justify-content: center;

  padding: 110px 20px 20px;

  background: rgba(0, 0, 0, 0.35);
}

.search-modal {
  width: 100%;
  max-width: 620px;
  padding: 24px;

  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 20px;
}

.modal-title {
  margin: 0;

  color: #222222;
  font-size: 22px;
  font-weight: 700;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;
  padding: 0;

  color: #666666;
  font-size: 28px;
  line-height: 1;

  background: transparent;
  border: none;
  border-radius: 50%;

  cursor: pointer;
}

.close-button:hover {
  color: #c53030;
  background: #f7f7f7;
}

.search-form {
  display: flex;
  gap: 10px;
}

.search-input-wrapper {
  position: relative;

  display: flex;
  align-items: center;

  flex: 1;
}

.search-icon {
  position: absolute;
  left: 16px;

  width: 20px;
  height: 20px;

  fill: none;
  stroke: #777777;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;

  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 50px;
  padding: 0 44px;

  color: #222222;
  font-size: 15px;

  background: #f7f7f7;
  border: 1px solid transparent;
  border-radius: 10px;
  outline: none;

  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.search-input:focus {
  background: #ffffff;
  border-color: #c53030;
}

.search-input::-webkit-search-cancel-button {
  display: none;
}

.clear-button {
  position: absolute;
  right: 14px;

  width: 24px;
  height: 24px;
  padding: 0;

  color: #888888;
  font-size: 20px;

  background: transparent;
  border: none;

  cursor: pointer;
}

.clear-button:hover {
  color: #c53030;
}

.search-submit-button {
  flex: 0 0 auto;

  height: 50px;
  padding: 0 22px;

  color: #ffffff;
  font-size: 15px;
  font-weight: 700;

  background: #c53030;
  border: none;
  border-radius: 10px;

  cursor: pointer;
}

.search-submit-button:hover {
  background: #a92727;
}

.search-modal-enter-active,
.search-modal-leave-active {
  transition: opacity 0.2s ease;
}

.search-modal-enter-active .search-modal,
.search-modal-leave-active .search-modal {
  transition: transform 0.2s ease;
}

.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;
}

.search-modal-enter-from .search-modal,
.search-modal-leave-to .search-modal {
  transform: translateY(-20px);
}

@media (max-width: 540px) {
  .search-overlay {
    padding: 90px 16px 16px;
  }

  .search-modal {
    padding: 20px;
  }

  .search-form {
    flex-direction: column;
  }

  .search-submit-button {
    width: 100%;
  }
}
</style>