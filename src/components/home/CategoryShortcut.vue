<script setup>
const categories = [
  {
    id: 'tourist',
    label: '관광지',
    icon: '🏛️',
    path: '/board/tourist',
  },
  {
    id: 'leports',
    label: '레포츠',
    icon: '🏄‍♂️',
    path: '/board/leports',
  },
  {
    id: 'culture',
    label: '문화시설',
    icon: '🏫',
    path: '/board/culture',
  },
  {
    id: 'shopping',
    label: '쇼핑',
    icon: '🛍️',
    path: '/board/shopping',
  },
  {
    id: 'course',
    label: '여행코스',
    icon: '🗺️',
    path: '/board/course',
  },
  {
    id: 'festival',
    label: '축제공연',
    icon: '🎉',
    path: '/board/festival',
  },
]
</script>

<template>
  <nav
    class="category-shortcut"
    aria-label="카테고리 바로가기"
  >
    <ul class="category-list">
      <li
        v-for="cat in categories"
        :key="cat.id"
        class="category-item"
      >
        <RouterLink
          :to="cat.path"
          class="category-button"
          :aria-label="`${cat.label} 카테고리`"
        >
          <span
            class="category-icon"
            aria-hidden="true"
          >
            {{ cat.icon }}
          </span>

          <span class="category-label">
            {{ cat.label }}
          </span>
        </RouterLink>
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
  align-items: center;

  margin: 0;
  padding: 0;

  overflow-x: auto;

  list-style: none;

  -webkit-overflow-scrolling: touch;
}

.category-item {
  flex: 0 0 auto;
}

.category-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-width: 96px;
  padding: 10px 14px;

  color: #222222;
  font-size: 14px;
  text-decoration: none;

  background: #ffffff;
  border: 1px solid #ececec;
  border-radius: 10px;

  cursor: pointer;

  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms;
}

.category-icon {
  font-size: 18px;
  line-height: 1;
}

.category-button:hover,
.category-button:focus {
  background-color: #fff7f7;
  box-shadow: 0 8px 20px rgba(15, 15, 15, 0.08);
  outline: none;
  transform: translateY(-4px);
}

.category-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(255, 85, 85, 0.12);
}

@media (min-width: 720px) {
  .category-list {
    flex-wrap: nowrap;
    justify-content: center;
  }
}

@media (max-width: 420px) {
  .category-button {
    min-width: 80px;
    padding: 8px 10px;

    font-size: 13px;
  }
}
</style>