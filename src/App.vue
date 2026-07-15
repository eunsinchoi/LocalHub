<script setup>
import AppHeader from './components/common/AppHeader.vue'
import ChatbotWidget from './components/chatbot/ChatbotWidget.vue'
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="page-container">
      <RouterView />
    </main>
    <ChatbotWidget />
  </div>
</template>

<style scoped>
/* 공통 페이지 영역 스타일 작성 */
</style>
