<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import {
  useRoute,
  useRouter,
} from 'vue-router'

import BoardSearch from '../components/board/BoardSearch.vue'
import PostTable from '../components/board/PostTable.vue'
import PaginationBar from '../components/board/PaginationBar.vue'

import {
  categories,
} from '../constants/categories.js'

import {
  getContentsByCategory,
} from '../services/contentFeedService.js'

import {
  searchItems,
} from '../utils/search.js'

const route = useRoute()
const router = useRouter()

const allPosts = ref([])
const currentPage = ref(1)

const submittedKeyword = ref('')

const pageSize = 10

const isLoading = ref(true)
const error = ref('')

const currentCategoryKey = computed(() => {
  return (
    route.params.category ||
    'tourist'
  )
})

const currentCategory = computed(() => {
  return (
    categories.find((category) => {
      const categoryKey =
        category.path
          .split('/')
          .filter(Boolean)
          .pop()

      return (
        categoryKey ===
        currentCategoryKey.value
      )
    }) || categories[0]
  )
})

const boardTitle = computed(() => {
  return `${currentCategory.value.name} 게시판`
})

const boardDescription = computed(() => {
  return (
    `${currentCategory.value.name}에 관한 ` +
    '이야기를 자유롭게 나눠보세요.'
  )
})

const filteredPosts = computed(() => {
  const keyword =
    submittedKeyword.value.trim()

  if (!keyword) {
    return allPosts.value
  }

  return searchItems(
    allPosts.value,
    keyword,
    allPosts.value.length,
  )
})

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(
      filteredPosts.value.length /
      pageSize,
    ),
  )
})

const pagedPosts = computed(() => {
  const start =
    (currentPage.value - 1) *
    pageSize

  return filteredPosts.value.slice(
    start,
    start + pageSize,
  )
})

const startNumber = computed(() => {
  return (
    (currentPage.value - 1) *
    pageSize
  )
})

async function loadPosts() {
  isLoading.value = true
  error.value = ''

  try {
    allPosts.value =
      await getContentsByCategory(
        currentCategoryKey.value,
      )

    submittedKeyword.value = ''
    currentPage.value = 1
  } catch (loadError) {
    console.error(
      '게시판 데이터 로드 실패:',
      loadError,
    )

    allPosts.value = []
    error.value =
      '게시글을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

function gotoPage(page) {
  currentPage.value = Math.min(
    Math.max(1, page),
    totalPages.value,
  )
}

function handleSearch(keyword) {
  submittedKeyword.value =
    String(keyword || '').trim()

  currentPage.value = 1
}

function moveToWrite() {
  router.push(
    `/board/${currentCategoryKey.value}/write`,
  )
}

watch(
  currentCategoryKey,
  loadPosts,
  {
    immediate: true,
  },
)
</script>

<template>
  <main class="board-list-view">
    <div class="board-container">
      <div class="board-header">
        <h1 class="board-title">
          {{ boardTitle }}
        </h1>

        <p class="board-description">
          {{ boardDescription }}
        </p>
      </div>

      <section class="board-toolbar">
        <div class="search-area">
          <BoardSearch
            @search="handleSearch"
          />
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
        <div
          v-if="isLoading"
          class="board-state"
        >
          게시글을 불러오는 중입니다.
        </div>

        <div
          v-else-if="error"
          class="board-state error"
        >
          {{ error }}
        </div>

        <PostTable
          v-else
          :posts="pagedPosts"
          :start-number="
            startNumber
          "
        />
      </section>

      <div
        v-if="
          !isLoading &&
          !error &&
          totalPages > 1
        "
        class="pagination-area"
      >
        <PaginationBar
          :current-page="
            currentPage
          "
          :total-pages="
            totalPages
          "
          @change="gotoPage"
        />
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

  background-color: #c8323e;
  border: 0;
  border-radius: 4px;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

.write-button:hover {
  background-color: #c8323e;
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

.board-state {
  padding: 60px 20px;

  color: #777777;
  text-align: center;
}

.board-state.error {
  color: #c8323e;
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