<script setup>
import PasswordModal from '../components/common/PasswordModal.vue'
import CommentSection from '../components/board/CommentSection.vue'
</script>

<template>
  <div class="post-detail-view">
    <h1>게시글 상세</h1>
    <!-- 게시글 상세 영역 작성 -->
    <CommentSection />
    <PasswordModal />
  </div>
</template>

<style scoped>
/* 게시글 상세 페이지 스타일 작성 */
</style>
