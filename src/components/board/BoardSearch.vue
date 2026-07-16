<script setup>
import { ref } from 'vue'

const emit = defineEmits([
  'search',
])

const searchKeyword = ref('')

function submitSearch() {
  emit(
    'search',
    searchKeyword.value.trim(),
  )
}
</script>

<template>
  <form
    class="search-shell"
    role="search"
    @submit.prevent="submitSearch"
  >
    <div class="search-box">
      <label
        class="search-input-area"
        for="board-search"
      >
        <span
          class="search-icon"
          aria-hidden="true"
        >
          🔎
        </span>

        <input
          id="board-search"
          v-model="searchKeyword"
          type="text"
          placeholder="검색할 제목이나 내용을 입력하세요"
        />
      </label>

      <button
        type="submit"
        class="search-hint"
      >
        검색
      </button>
    </div>
  </form>
</template>

<style scoped>
.search-shell {
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;

  width: 100%;
  padding: 14px 16px;

  background-color: #ffffff;
  border: 1px solid #d7d7d7;
  border-radius: 12px;

  box-shadow:
    0 2px 8px
    rgba(0, 0, 0, 0.04);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  box-sizing: border-box;
}

.search-box:hover,
.search-box:focus-within {
  border-color: #c8323e;

  box-shadow:
    0 0 0 3px
    rgba(239, 63, 54, 0.12);
}

.search-input-area {
  display: flex;
  align-items: center;
  gap: 10px;

  flex: 1;
  min-width: 0;

  cursor: text;
}

.search-icon {
  flex-shrink: 0;
  font-size: 16px;
}

.search-box input {
  flex: 1;
  min-width: 0;

  color: #333333;
  font-size: 15px;

  background: transparent;
  border: none;
  outline: none;
}

.search-hint {
  flex-shrink: 0;
  padding: 0;

  color: #c8323e;
  font-family: inherit;
  font-size: inherit;
  font-weight: 700;
  white-space: nowrap;

  background: transparent;
  border: none;

  cursor: pointer;
}

.search-hint:hover {
  text-decoration: underline;
}

.search-hint:focus-visible {
  outline: 2px solid #c8323e;
  outline-offset: 3px;
  border-radius: 2px;
}
</style>