<template>
  <div class="recent-posts-page">
    <h1>최근 게시글 전체 목록</h1>
    <!-- 여기에서 전체 목록을 다시 뿌려주거나, 상위 20개 등을 보여줍니다 -->
    <ul>
      <li v-for="post in allRecentPosts" :key="post.contentid">
        {{ post.title }} - {{ post.categoryName }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// 여기서 아까 RecentPosts.vue에서 썼던 데이터 로딩 로직을 가져와서 사용하세요
const allRecentPosts = ref([]);
// ... 데이터 로딩 로직 구현 ...
</script>