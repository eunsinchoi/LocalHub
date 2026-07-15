Here's the updated RecentPosts.vue with the post title turned into a link to the post detail page (uses the `post-detail` route):

```vue
<script setup>
import { ref, onMounted } from 'vue';

const recentPosts = ref([]);

const fileData = [
  { name: '서울_관광지.json', cat: '관광지' },
  { name: '서울_레포츠.json', cat: '레포츠' },
  { name: '서울_문화시설.json', cat: '문화시설' },
  { name: '서울_쇼핑.json', cat: '쇼핑' },
  { name: '서울_숙박.json', cat: '숙박' },
  { name: '서울_여행코스.json', cat: '여행코스' },
  { name: '서울_축제공연행사.json', cat: '축제공연' }
];

function formatDate(modifiedtime) {
  if (!modifiedtime) return '';
  const s = String(modifiedtime);
  if (s.length >= 8) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
  return s;
}

onMounted(async () => {
  let allPosts = [];
  for (const file of fileData) {
    try {
      const res = await fetch(`/data/${file.name}`);
      const data = await res.json();
      if (data && data.items) {
        const withCat = data.items.map(p => ({ ...p, categoryName: file.cat }));
        allPosts = allPosts.concat(withCat);
      }
    } catch (e) {
      console.error(`${file.name} 로드 실패`, e);
    }
  }

  allPosts.sort((a, b) => (b.modifiedtime || '').localeCompare(a.modifiedtime || ''));
  recentPosts.value = allPosts.slice(0, 5);
});
</script>

<template>
  <section class="recent-posts">
    <div class="header">
      <h2>최근 게시글</h2>
<<<<<<< HEAD
      <router-link
        to="/recent-posts"
        class="more-button"
      >
        더보기 &gt;
      </router-link>
=======
      <router-link to="/recent-posts" class="more">더보기 &gt;</router-link>
>>>>>>> feat/home-view
    </div>

    <ul class="post-list" aria-live="polite">
      <li v-for="post in recentPosts" :key="post.contentid" class="post-item">
        <router-link
          class="title"
          :to="{ name: 'post-detail', params: { id: post.contentid } }"
        >
          {{ post.title }}
        </router-link>

        <div class="meta">
          <span class="category">{{ post.categoryName }}</span>
          <span class="date">{{ formatDate(post.modifiedtime) }}</span>
        </div>
      </li>

      <li v-if="recentPosts.length === 0" class="empty">게시글이 없습니다.</li>
    </ul>
  </section>
</template>

<style scoped>
.recent-posts {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(12,12,12,0.06);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
}

.title { flex: 1; font-weight: bold; margin-left: 10px; }
.category { flex: 0 0 80px; font-size: 12px; color: #555; background-color: #eee; padding: 4px 8px; border-radius: 4px; text-align: center; margin: 0 15px; }
.date { flex: 0 0 80px; font-size: 13px; color: #999; text-align: right; }
.more-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 76px;
  height: 32px;
  padding: 0 14px;

  color: #c53030;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  background: #fff7f7;
  border: 1px solid #c53030;
  border-radius: 6px;

  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.more-button:hover {
  color: #ffffff;
  background: #c53030;
  transform: translateY(-1px);
}

.more-button:focus-visible {
  outline: 3px solid rgba(197, 48, 48, 0.18);
  outline-offset: 2px;
}
.more {
  color: #c8323e;
  text-decoration: none;
  font-weight: 600;
}

.post-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.title {
  flex: 1;
  font-weight: 500;
  margin-right: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #202020;
  text-decoration: none;
}

.title:hover {
  text-decoration: underline;
}

.meta {
  flex: 0 0 auto;
  display: flex;
  gap: 10px;
  font-size: 13px;
  color: #777;
  align-items: center;
}

.category {
  background: #f2f2f2;
  padding: 4px 8px;
  border-radius: 4px;
  color: #555;
}

.empty {
  padding: 18px 0;
  text-align: center;
  color: #777;
}

/* Responsive */
@media (max-width: 520px) {
  .recent-posts { padding: 16px; }
  .title { font-size: 14px; }
  .meta { font-size: 12px; gap: 6px; }
}
</style>