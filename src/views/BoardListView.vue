<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getCategoryName } from '../services/localDataService'
import BoardSearch from '../components/board/BoardSearch.vue'
import PostTable from '../components/board/PostTable.vue'
import PaginationBar from '../components/board/PaginationBar.vue'

const route = useRoute()
const router = useRouter()

const currentCategory = computed(() => route.params.category || 'tourist')
const currentCategoryName = computed(
  () => getCategoryName(currentCategory.value) || '게시판',
)
const boardTitle = computed(() => `${currentCategoryName.value} 게시판`)
const boardDescription = computed(() => {
  const descriptions = {
    tourist: '관광지 관련 정보와 여행 경험을 나눠보세요.',
    leports: '레포츠 일정과 추천 코스를 공유해보세요.',
    culture: '문화시설 방문 후기를 남겨보세요.',
    shopping: '쇼핑 추천 포인트와 할인 정보를 나눠보세요.',
    course: '여행 코스와 일정 계획을 공유해보세요.',
    festival: '축제와 공연 소식, 후기를 이야기해보세요.',
  }

  return descriptions[currentCategory.value] || '여행과 지역 정보를 자유롭게 나눠보세요.'
})

const moveToWrite = () => {
  router.push({
    name: 'post-write',
    params: { category: currentCategory.value },
  })
import { categories } from '../constants/categories.js'

const route = useRoute()
const router = useRouter()

const currentCategoryKey = computed(() => {
  return route.params.category || 'tourist'
})

const currentCategory = computed(() => {
  return (
    categories.find((category) => {
      const key = category.path
        .split('/')
        .filter(Boolean)
        .pop()

      return key === currentCategoryKey.value
    }) || categories[0]
  )
})

const boardTitle = computed(() => {
  return `${currentCategory.value.name} 게시판`
})

const moveToWrite = () => {
  router.push(
    `/board/${currentCategoryKey.value}/write`,
  )
}
</script>

<template>
  <main class="board-list-view">
    <div class="board-container">
      <div class="board-header">
        <h1 class="board-title">{{ boardTitle }}</h1>
        <h1 class="board-title">
          {{ boardTitle }}
        </h1>

        <p class="board-description">
          {{ boardDescription }}
        </p>
      </div>

      <section class="board-toolbar">
        <div class="search-area">
          <BoardSearch />
        </div>

        <button
          type="button"
          class="write-button"
          @click="moveToWrite"
        >
          글쓰기
        </button>
      </section>

      <section class="board-content">
        <PostTable />
      </section>

      <div class="pagination-area">
        <PaginationBar />
      </div>
    </div>
  </main>
</template>

<style scoped>
.board-list-view {
  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 48px 20px 80px;
  background-color: #ffffff;
  box-sizing: border-box;
}

.board-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.board-header {
  margin-bottom: 32px;
}

.board-title {
  margin: 0;
  color: #222222;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
}

.board-description {
  margin: 8px 0 0;
  color: #777777;
  font-size: 14px;
}

.board-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.search-area {
  flex: 1;
  max-width: 720px;
}

.search-area :deep(> *) {
  width: 100%;
}

.write-button {
  flex-shrink: 0;
  min-width: 96px;
  height: 44px;
  padding: 0 22px;

  color: #ffffff;
  font-size: 14px;
  font-weight: 700;

  background-color: #ef3f36;
  border: 0;
  border-radius: 4px;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

.write-button:hover {
  background-color: #d9322a;
}

.board-content {
  width: 100%;
  overflow-x: auto;
  border-top: 2px solid #333333;
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 36px;
}

@media (max-width: 768px) {
  .board-list-view {
    padding: 32px 16px 60px;
  }

  .board-title {
    font-size: 24px;
  }

  .board-toolbar {
    align-items: stretch;
  }

  .search-area {
    max-width: none;
  }

  .write-button {
    height: 42px;
  }
}

@media (max-width: 520px) {
  .board-toolbar {
    flex-direction: column;
  }

  .write-button {
    width: 100%;
  }

  .board-content {
    border-top-width: 1px;
  }
}
</style>