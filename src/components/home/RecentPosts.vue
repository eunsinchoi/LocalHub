<<script setup>
import { ref, onMounted } from 'vue';

const recentPosts = ref([]);

onMounted(async () => {
  // ... (기존 데이터 로딩 로직 동일)
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
        const postsWithCat = data.items.map(post => ({ ...post, categoryName: file.cat }));
        allPosts = [...allPosts, ...postsWithCat];
      }
    } catch (e) { console.error(`${file.name} 로드 실패`); }
  }
  allPosts.sort((a, b) => b.modifiedtime - a.modifiedtime);
  recentPosts.value = allPosts.slice(0, 5);
});
</script>

<template>
  <section class="recent-posts">
    <div class="header">
      <h2>최근 게시글</h2>
      <router-link to="/recent-posts">더보기 ></router-link>
    </div>
    <ul class="post-list">
      <!-- (post, index)로 순번을 가져옵니다 -->
      <li v-for="(post, index) in recentPosts" :key="post.contentid" class="post-item">
        <span class="number">{{ index + 1 }}</span>
        <span class="title">{{ post.title }}</span>
        <span class="category">{{ post.categoryName }}</span>
        <span class="date">{{ post.modifiedtime ? post.modifiedtime.substring(0, 8) : '' }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.recent-posts {
  width: 100%;
  margin-top: 24px;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  box-sizing: border-box;
}

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.post-list { list-style: none; padding: 0; margin: 0; }
.post-item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #f0f0f0; }

/* 번호 스타일 */
.number { flex: 0 0 40px; font-weight: bold; color: #333; }

.title { flex: 1; font-weight: bold; margin-left: 10px; }
.category { flex: 0 0 80px; font-size: 12px; color: #555; background-color: #eee; padding: 4px 8px; border-radius: 4px; text-align: center; margin: 0 15px; }
.date { flex: 0 0 80px; font-size: 13px; color: #999; text-align: right; }
</style>