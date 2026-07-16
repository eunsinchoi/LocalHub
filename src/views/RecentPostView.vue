<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import PaginationBar from '../components/board/PaginationBar.vue'

import {
  getAllContents,
} from '../services/contentFeedService.js'

const allRecentPosts = ref([])
const currentPage = ref(1)
const pageSize = 10

const isLoading = ref(true)
const error = ref('')

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(
      allRecentPosts.value.length /
      pageSize,
    ),
  )
})

const pagedPosts = computed(() => {
  const start =
    (currentPage.value - 1) *
    pageSize

  return allRecentPosts.value.slice(
    start,
    start + pageSize,
  )
})

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const dateText =
    String(value)

  /*
   * TourAPI 원본 형식
   * 20260715153000
   */
  if (/^\d{8}/.test(dateText)) {
    return [
      dateText.slice(0, 4),
      dateText.slice(4, 6),
      dateText.slice(6, 8),
    ].join('-')
  }

  /*
   * 사용자 게시물 ISO 형식
   * 2026-07-15T15:30:00.000Z
   *
   * JSON 정규화 형식
   * 2026-07-15 15:30
   */
  return dateText.slice(0, 10)
}

function gotoPage(page) {
  currentPage.value = Math.min(
    Math.max(1, page),
    totalPages.value,
  )
}

async function loadRecentPosts() {
  isLoading.value = true
  error.value = ''

  try {
    allRecentPosts.value =
      await getAllContents()

    currentPage.value = 1
  } catch (loadError) {
    console.error(
      '최근 게시글 로드 실패:',
      loadError,
    )

    allRecentPosts.value = []
    error.value =
      '최근 게시글을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadRecentPosts)
</script>

<template>
  <section class="recent-posts-view">
    <h1>최근 게시글 전체 목록</h1>

    <div class="card">
      <div
        v-if="isLoading"
        class="empty"
      >
        게시글을 불러오는 중입니다.
      </div>

      <div
        v-else-if="error"
        class="empty"
      >
        {{ error }}
      </div>

      <div
        v-else
        class="table-wrap"
        role="region"
        aria-label="최근 게시글 목록"
      >
        <table class="posts-table">
          <thead>
            <tr>
              <th scope="col">
                No.
              </th>

              <th scope="col">
                제목
              </th>

              <th scope="col">
                카테고리
              </th>

              <th scope="col">
                수정일
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(
                post,
                index
              ) in pagedPosts"
              :key="
                post.feedId ||
                `${post.source}:${post.id}`
              "
            >
              <td class="num">
                {{
                  (currentPage - 1) *
                    pageSize +
                  index +
                  1
                }}
              </td>

              <td class="title">
                <RouterLink
                  :to="{
                    name: 'post-detail',

                    params: {
                      id: post.id,
                    },

                    query: {
                      source:
                        post.source,
                    },
                  }"
                  class="title-link"
                >
                  {{ post.title }}
                </RouterLink>
              </td>

              <td class="category">
                {{ post.category }}
              </td>

              <td class="date">
                {{
                  formatDate(
                    post.modifiedAt ||
                    post.createdAt,
                  )
                }}
              </td>
            </tr>

            <tr
              v-if="
                allRecentPosts.length ===
                0
              "
            >
              <td
                colspan="4"
                class="empty"
              >
                게시글이 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="
          !isLoading &&
          !error &&
          totalPages > 1
        "
        class="pagination-wrap"
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
  </section>
</template>

<style scoped>
.recent-posts-view {
  padding: 20px;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(12,12,12,0.06);
  padding: 18px;
  max-width: 1100px;
  margin: 0 auto;
}

.table-wrap {
  overflow-x: auto;
}

.posts-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}

.posts-table thead th {
  text-align: left;
  font-weight: 600;
  padding: 12px 16px;
  color: #444;
  border-bottom: 1px solid #eee;
}

.posts-table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  color: #333;
}

.title-link {
  color: #1f2937;
  text-decoration: none;
  font-weight: 500;
}

.title-link:hover {
  text-decoration: underline;
}

.num { width: 64px; color:#666; }
.title { width: 60%; font-weight:500; }
.category { width: 160px; color:#666; }
.date { width: 160px; color:#888; }

.empty {
  text-align: center;
  padding: 18px;
  color: #777;
}

@media (max-width: 720px) {
  .card { padding: 12px; }
  .posts-table thead th, .posts-table tbody td { padding: 10px 12px; }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
}

.pager-left,
.pager-right {
  display: flex;
  gap: 6px;
}

.pager-list {
  display: flex;
  align-items: center;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.pager-list li {
  list-style: none;
}

.pager-btn,
.pager-number {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pager-number.active {
  background: #c8323e;
  color: white;
  border-color: #c8323e;
}
</style>