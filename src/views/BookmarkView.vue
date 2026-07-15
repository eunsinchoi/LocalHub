<script setup>
import PostTable from '../components/board/PostTable.vue'

const bookmarkedPosts = [
  {
    id: 10,
    title: '관광지 주변 맛집 추천해요',
    createdAt: '2026-07-14',
  },
  {
    id: 9,
    title: '야경이 정말 예뻤던 곳이었어요',
    createdAt: '2026-07-12',
  },
  {
    id: 8,
    title: '주말에 가기 좋은 코스 공유합니다',
    createdAt: '2026-07-09',
  },
]
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
        <PostTable :posts="bookmarkedPosts" />
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
  overflow: hidden;

  border-top: 2px solid #333333;
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