<script setup>
import {
  onActivated,
  onMounted,
  ref,
} from 'vue'

import PostTable from '../components/board/PostTable.vue'

import {
  getAllContents,
} from '../services/contentFeedService.js'

import {
  getBookmarks,
} from '../services/bookmarkService.js'

const bookmarkedPosts = ref([])
const isLoading = ref(true)
const error = ref('')

function getContentBookmarkKey(content) {
  return (
    content.feedId ||
    `${content.source}:${content.id}`
  )
}

async function loadBookmarkedPosts() {
  isLoading.value = true
  error.value = ''

  try {
    const [
      allContents,
      savedBookmarks,
    ] = await Promise.all([
      getAllContents(),
      Promise.resolve(
        getBookmarks(),
      ),
    ])

    const bookmarkSet = new Set(
      savedBookmarks.map(
        (bookmarkId) =>
          String(bookmarkId),
      ),
    )

    bookmarkedPosts.value =
      allContents.filter((content) => {
        const bookmarkKey =
          getContentBookmarkKey(
            content,
          )

        return bookmarkSet.has(
          String(bookmarkKey),
        )
      })
  } catch (loadError) {
    console.error(
      '북마크 목록 로드 실패:',
      loadError,
    )

    bookmarkedPosts.value = []
    error.value =
      '북마크 목록을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadBookmarkedPosts)

/*
 * KeepAlive를 사용하고 있을 경우,
 * 상세 페이지에서 북마크를 변경한 뒤 돌아왔을 때
 * 목록을 다시 불러옵니다.
 */
onActivated(loadBookmarkedPosts)
</script>

<template>
  <main class="bookmark-view">
    <div class="bookmark-container">
      <header class="bookmark-header">
        <h1 class="bookmark-title">
          북마크
        </h1>

        <p class="bookmark-description">
          저장한 게시글을 한곳에서 확인해보세요.
        </p>
      </header>

      <section class="bookmark-content">
        <div
          v-if="isLoading"
          class="bookmark-state"
        >
          북마크를 불러오는 중입니다.
        </div>

        <div
          v-else-if="error"
          class="bookmark-state error"
        >
          {{ error }}
        </div>

        <PostTable
          v-else
          :posts="bookmarkedPosts"
          :start-number="0"
        />
      </section>
    </div>
  </main>
</template>

<style scoped>
.bookmark-view {
  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 48px 20px 80px;

  background: #ffffff;
  box-sizing: border-box;
}

.bookmark-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.bookmark-header {
  margin-bottom: 32px;
}

.bookmark-title {
  margin: 0;

  color: #222222;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
}

.bookmark-description {
  margin: 8px 0 0;

  color: #777777;
  font-size: 14px;
}

.bookmark-content {
  width: 100%;
  overflow-x: auto;

  border-top: 2px solid #333333;
}

.bookmark-state {
  padding: 60px 20px;

  color: #777777;
  text-align: center;
}

.bookmark-state.error {
  color: #c8323e;
}

@media (max-width: 768px) {
  .bookmark-view {
    padding: 32px 16px 60px;
  }

  .bookmark-title {
    font-size: 24px;
  }
}
</style>