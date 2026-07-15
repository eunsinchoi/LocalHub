<script setup>
import MainBanner from '../components/home/MainBanner.vue'
import CategoryShortcut from '../components/home/CategoryShortcut.vue'
import RecentPosts from '../components/home/RecentPosts.vue'
</script>

<template>
  <div class="home-view">
    <MainBanner />

    <div class="home-container">
      <CategoryShortcut />
      <RecentPosts />
    </div>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}
</style>
