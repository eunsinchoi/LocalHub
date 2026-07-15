<script setup>
const emit = defineEmits(['select']);

const categories = [
  { id: 'tour', label: '관광지', icon: '🏛️' },
  { id: 'sports', label: '레포츠', icon: '🏄‍♂️' },
  { id: 'culture', label: '문화시설', icon: '🏫' },
  { id: 'shopping', label: '쇼핑', icon: '🛍️' },
  { id: 'course', label: '여행코스', icon: '🗺️' },
  { id: 'festival', label: '축제공연', icon: '🎉' }
];
</script>

<template>
  <nav class="category-shortcut" aria-label="카테고리 바로가기">
    <ul class="category-list">
      <li v-for="cat in categories" :key="cat.id" class="category-item">
        <button
          type="button"
          class="category-button"
          @click="$emit('select', cat.id)"
          :aria-label="`${cat.label} 카테고리`"
        >
          <span class="category-icon" aria-hidden="true">{{ cat.icon }}</span>
          <span class="category-label">{{ cat.label }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.category-shortcut {
  padding: 12px 16px;
}

.category-list {
  display: flex;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  align-items: center;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Individual item */
.category-item {
  flex: 0 0 auto;
}

/* Button styling */
.category-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #ececec;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, background-color 160ms;
  font-size: 14px;
  color: #222;
  min-width: 96px;
  justify-content: center;
}

/* Icon */
.category-icon {
  font-size: 18px;
  line-height: 1;
}

/* Hover / focus */
.category-button:hover,
.category-button:focus {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(15, 15, 15, 0.08);
  background-color: #fff7f7;
  outline: none;
}

/* Focus-visible for accessibility */
.category-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(255, 85, 85, 0.12);
}

/* Responsive: wrap into multiple rows on larger screens */
@media (min-width: 720px) {
  .category-list {
    flex-wrap: nowrap;
    justify-content: center;
  }
}

/* On very small screens keep compact sizing */
@media (max-width: 420px) {
  .category-button {
    padding: 8px 10px;
    min-width: 80px;
    font-size: 13px;
  }
}
</style>