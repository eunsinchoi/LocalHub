<script setup>
defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 3,
  },
})

const emit = defineEmits(['change'])
</script>

<template>
  <nav
    class="pagination"
    aria-label="페이지 이동"
  >
    <button
      type="button"
      class="page-button"
      :disabled="currentPage === 1"
      @click="emit('change', currentPage - 1)"
    >
      &lt;
    </button>

    <button
      v-for="page in totalPages"
      :key="page"
      type="button"
      class="page-button"
      :class="{ active: page === currentPage }"
      @click="emit('change', page)"
    >
      {{ page }}
    </button>

    <button
      type="button"
      class="page-button"
      :disabled="currentPage === totalPages"
      @click="emit('change', currentPage + 1)"
    >
      &gt;
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.page-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;
  padding: 0;

  color: #555555;
  font-size: 14px;

  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 5px;

  cursor: pointer;
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

.page-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
</style>