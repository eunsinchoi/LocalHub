<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },

  totalPages: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['change'])

const safeTotalPages = computed(() => {
  return Math.max(1, props.totalPages)
})

const visiblePages = computed(() => {
  const total = safeTotalPages.value
  const current = Math.min(
    Math.max(1, props.currentPage),
    total,
  )

  const maxVisiblePages = 7

  // 전체 페이지가 7개 이하면 모두 표시
  if (total <= maxVisiblePages) {
    return Array.from(
      { length: total },
      (_, index) => ({
        type: 'page',
        value: index + 1,
        key: `page-${index + 1}`,
      }),
    )
  }

  const half = Math.floor(maxVisiblePages / 2)

  let startPage = current - half
  let endPage = current + half

  // 현재 페이지가 앞쪽에 있을 때
  if (startPage < 1) {
    startPage = 1
    endPage = maxVisiblePages
  }

  // 현재 페이지가 뒤쪽에 있을 때
  if (endPage > total) {
    endPage = total
    startPage = total - maxVisiblePages + 1
  }

  const pages = []

  // 앞쪽 생략 표시
  if (startPage > 1) {
    pages.push({
      type: 'ellipsis',
      key: 'start-ellipsis',
    })
  }

  // 페이지 번호 최대 7개
  for (let page = startPage; page <= endPage; page++) {
    pages.push({
      type: 'page',
      value: page,
      key: `page-${page}`,
    })
  }

  // 뒤쪽 생략 표시
  if (endPage < total) {
    pages.push({
      type: 'ellipsis',
      key: 'end-ellipsis',
    })
  }

  return pages
})

function movePage(page) {
  if (
    page < 1 ||
    page > safeTotalPages.value ||
    page === props.currentPage
  ) {
    return
  }

  emit('change', page)
}
</script>

<template>
  <nav
    class="pagination"
    aria-label="페이지 이동"
  >
    <!-- 첫 페이지 -->
    <button
      type="button"
      class="page-button arrow-button"
      :disabled="currentPage === 1"
      aria-label="첫 페이지"
      @click="movePage(1)"
    >
      &lt;&lt;
    </button>

    <!-- 이전 페이지 -->
    <button
      type="button"
      class="page-button arrow-button"
      :disabled="currentPage === 1"
      aria-label="이전 페이지"
      @click="movePage(currentPage - 1)"
    >
      &lt;
    </button>

    <!-- 페이지 번호 -->
    <template
      v-for="item in visiblePages"
      :key="item.key"
    >
      <button
        v-if="item.type === 'page'"
        type="button"
        class="page-button"
        :class="{
          active: item.value === currentPage,
        }"
        :aria-current="
          item.value === currentPage
            ? 'page'
            : undefined
        "
        @click="movePage(item.value)"
      >
        {{ item.value }}
      </button>

      <span
        v-else
        class="page-ellipsis"
        aria-hidden="true"
      >
        ...
      </span>
    </template>

    <!-- 다음 페이지 -->
    <button
      type="button"
      class="page-button arrow-button"
      :disabled="
        currentPage === safeTotalPages
      "
      aria-label="다음 페이지"
      @click="
        movePage(currentPage + 1)
      "
    >
      &gt;
    </button>

    <!-- 마지막 페이지 -->
    <button
      type="button"
      class="page-button arrow-button"
      :disabled="
        currentPage === safeTotalPages
      "
      aria-label="마지막 페이지"
      @click="
        movePage(safeTotalPages)
      "
    >
      &gt;&gt;
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  width: 100%;
  margin: 0;
  padding: 0;

  list-style: none;
}

.page-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;

  width: 36px;
  height: 36px;
  padding: 0;

  color: #555555;
  font-size: 14px;
  font-weight: 500;

  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 5px;

  cursor: pointer;

  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.page-button:hover:not(:disabled) {
  color: #c8323e;
  border-color: #c8323e;
}

.page-button.active {
  color: #ffffff;
  font-weight: 700;

  background: #c8323e;
  border-color: #c8323e;
}

.page-button:focus-visible {
  outline: 3px solid rgba(200, 50, 62, 0.18);
  outline-offset: 2px;
}

.page-button:disabled {
  color: #bbbbbb;

  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.55;
}

.arrow-button {
  width: 40px;
}

.page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 36px;

  color: #888888;
  font-size: 14px;
  letter-spacing: 1px;

  user-select: none;
}

@media (max-width: 520px) {
  .pagination {
    justify-content: flex-start;
    gap: 4px;

    overflow-x: auto;
    padding-bottom: 4px;
  }

  .page-button {
    width: 34px;
    height: 34px;
  }

  .arrow-button {
    width: 38px;
  }
}
</style>