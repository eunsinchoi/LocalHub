<script setup>
import { ref, onMounted } from 'vue';

const recentPosts = ref([]);

onMounted(async () => {
  // 파일명을 카테고리 이름으로 바로 사용하기 위해 객체로 관리합니다.
  const fileData = [
    { name: '서울_관광지.json', cat: '관광지' },
    { name: '서울_레포츠.json', cat: '레포츠' },
    { name: '서울_문화시설.json', cat: '문화시설' },
    { name: '서울_쇼핑.json', cat: '쇼핑' },
    { name: '서울_숙박.json', cat: '숙박' },
    { name: '서울_여행코스.json', cat: '여행코스' },
    { name: '서울_축제공연행사.json', cat: '축제공연' }
  ];

  let allPosts = [];
  for (const file of fileData) {
    try {
      const response = await fetch(`/data/${file.name}`);
      const data = await response.json();
      if (data && data.items) {
        // 각 게시글에 카테고리 이름을 추가해서 저장
        const postsWithCat = data.items.map(post => ({ ...post, categoryName: file.cat }));
        allPosts = [...allPosts, ...postsWithCat];
      }
    } catch (e) {
      console.error(`${file.name} 로드 실패`);
    }
  }
  
  allPosts.sort((a, b) => b.modifiedtime - a.modifiedtime);
  recentPosts.value = allPosts.slice(0, 5);
});
</script>

<template>
  <section class="recent-posts">
    <div class="header">
      <h2>최근 게시글</h2>
      <a href="#">더보기 ></a>
    </div>
    <ul class="post-list">
      <li v-for="post in recentPosts" :key="post.contentid" class="post-item">
        <span class="title">{{ post.title }}</span>
        <!-- 우리가 직접 넣어준 categoryName을 표시 -->
        <span class="category">{{ post.categoryName }}</span>
        <span class="date">{{ post.modifiedtime ? post.modifiedtime.substring(0, 8) : '' }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* 기존 스타일과 동일합니다 */
.recent-posts { padding: 30px; max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fff; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.post-list { list-style: none; padding: 0; }
.post-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
.title { flex: 2; font-weight: bold; }
.category { flex: 0 0 80px; font-size: 12px; color: #555; background-color: #eee; padding: 4px 8px; border-radius: 4px; text-align: center; margin: 0 15px; }
.date { flex: 0 0 80px; font-size: 13px; color: #999; text-align: right; }
</style>