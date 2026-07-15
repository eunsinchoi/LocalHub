<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import {
  useRoute,
} from 'vue-router'

import PostTable from '../components/board/PostTable.vue'
import PaginationBar from '../components/board/PaginationBar.vue'

import {
  getAllContents,
} from '../services/contentFeedService.js'

import {
  searchItems,
} from '../utils/search.js'

const route = useRoute()

const searchResults = ref([])
const currentPage = ref(1)

const isLoading = ref(true)
const error = ref('')

const pageSize = 10

/*
 * SearchModal.vue에서 전달한 검색어
 *
 * 주소 예:
 * /search?keyword=카페
 */
const keyword = computed(() => {
  return String(
    route.query.keyword || '',
  ).trim()
})

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(
      searchResults.value.length /
      pageSize,
    ),
  )
})

const pagedResults = computed(() => {
  const start =
    (currentPage.value - 1) *
    pageSize

  return searchResults.value.slice(
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

const resultDescription = computed(() => {
  if (!keyword.value) {
    return '검색어를 입력해주세요.'
  }

  return (
    `"${keyword.value}" 검색 결과 ` +
    `${searchResults.value.length}건`
  )
})

async function loadSearchResults() {
  isLoading.value = true
  error.value = ''
  currentPage.value = 1

  if (!keyword.value) {
    searchResults.value = []
    isLoading.value = false
    return
  }

  try {
    /*
     * JSON 콘텐츠와 사용자 게시물을
     * 모두 합친 전체 데이터를 가져옵니다.
     */
    const allContents =
      await getAllContents()

    /*
     * searchItems 기본값은 5개이므로,
     * 통합검색 화면에서는 전체 개수를
     * limit으로 전달합니다.
     */
    searchResults.value =
      searchItems(
        allContents,
        keyword.value,
        allContents.length,
      )
  } catch (loadError) {
    console.error(
      '통합검색 결과 로드 실패:',
      loadError,
    )

    searchResults.value = []

    error.value =
      '검색 결과를 불러오지 못했습니다.'
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

/*
 * 검색 결과 화면에서 다시 헤더 검색을 실행하면
 * 같은 컴포넌트를 유지한 채 query만 바뀔 수 있습니다.
 *
 * query 변경을 감지해 결과를 다시 불러옵니다.
 */
watch(
  keyword,
  loadSearchResults,
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
          검색 결과
        </h1>

        <p class="board-description">
          {{ resultDescription }}
        </p>
      </div>

      <!--
        BoardListView의 검색창과 글쓰기 버튼은
        이 화면에서 제외합니다.
      -->

      <section class="board-content">
        <div
          v-if="isLoading"
          class="board-state"
        >
          검색 결과를 불러오는 중입니다.
        </div>

        <div
          v-else-if="error"
          class="board-state error"
        >
          {{ error }}
        </div>

        <div
          v-else-if="
            searchResults.length === 0
          "
          class="board-state"
        >
          <template v-if="keyword">
            검색 결과가 없습니다.
          </template>

          <template v-else>
            검색어를 입력해주세요.
          </template>
        </div>

        <PostTable
          v-else
          :posts="pagedResults"
          :start-number="startNumber"
        />
      </section>

      <div
        v-if="
          !isLoading &&
          !error &&
          searchResults.length > 0 &&
          totalPages > 1
        "
        class="pagination-area"
      >
        <PaginationBar
          :current-page="currentPage"
          :total-pages="totalPages"
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
}

@media (max-width: 520px) {
  .board-content {
    border-top-width: 1px;
  }
}
</style>