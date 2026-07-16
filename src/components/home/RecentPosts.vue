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
      <router-link
        to="/recent-posts"
        class="more-button">더보기 &gt;
      </router-link>
    </div>
    <ul class="post-list" aria-live="polite">
      <li v-for="post in recentPosts" :key="post.contentid" class="post-item">
        <router-link
class="title"
  :to="{
    name: 'post-detail',
    params: {
      id: String(post.contentid)
    },
    query: {
      source: 'tour'
    }
  }"
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
  width: 100%;
  min-width: 0;
  padding: 20px;

  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(12, 12, 12, 0.06);

  box-sizing: border-box;
}

.recent-posts * {
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  min-width: 0;
  margin-bottom: 12px;
}

.header h2 {
  flex: 1;
  min-width: 0;
  margin: 0;

  color: #222222;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
}

.post-list {
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;

  list-style: none;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 12px;

  width: 100%;
  min-width: 0;
  padding: 12px 0;

  border-bottom: 1px solid #f5f5f5;
}

.title {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;

  overflow: hidden;

  color: #202020;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title:hover {
  color: #c8323e;
  text-decoration: underline;
}

.meta {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;

  min-width: 0;

  color: #777777;
  font-size: 13px;
}

.category {
  flex: 0 0 80px;
  width: 80px;
  margin: 0;
  padding: 4px 8px;

  overflow: hidden;

  color: #555555;
  font-size: 12px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;

  background: #f2f2f2;
  border-radius: 4px;
}

.date {
  flex: 0 0 82px;
  width: 82px;

  color: #999999;
  font-size: 13px;
  text-align: right;
  white-space: nowrap;
}

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