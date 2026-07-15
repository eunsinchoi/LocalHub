<script setup>
import { ref, computed, onMounted } from 'vue';

const allRecentPosts = ref([]);
const pageSize = 10;
const currentPage = ref(1);

const fileData = [
  { name: '서울_관광지.json', cat: '관광지' },
  { name: '서울_레포츠.json', cat: '레포츠' },
  { name: '서울_문화시설.json', cat: '문화시설' },
  { name: '서울_쇼핑.json', cat: '쇼핑' },
  { name: '서울_숙박.json', cat: '숙박' },
  { name: '서울_여행코스.json', cat: '여행코스' },
  { name: '서울_축제공연행사.json', cat: '축제공연' }
];

onMounted(async () => {
  let posts = [];
  for (const file of fileData) {
    try {
      const res = await fetch(`/data/${file.name}`);
      const data = await res.json();
      if (data && data.items) {
        const postsWithCat = data.items.map(post => ({ ...post, categoryName: file.cat }));
        posts = posts.concat(postsWithCat);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`${file.name} 로드 실패`, err);
    }
  }
  posts.sort((a, b) => {
    const ma = a.modifiedtime || '';
    const mb = b.modifiedtime || '';
    if (mb > ma) return 1;
    if (mb < ma) return -1;
    return 0;
  });
  allRecentPosts.value = posts;
});

const totalPages = computed(() => Math.max(1, Math.ceil(allRecentPosts.value.length / pageSize)));

const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return allRecentPosts.value.slice(start, start + pageSize);
});

function formatDate(modifiedtime) {
  if (!modifiedtime) return '';
  const s = String(modifiedtime);
  if (s.length >= 8) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
  return s;
}

function gotoPage(n) {
  const p = Math.min(Math.max(1, n), totalPages.value);
  currentPage.value = p;
}

function prevPage() {
  gotoPage(currentPage.value - 1);
}

function nextPage() {
  gotoPage(currentPage.value + 1);
}

function firstPage() {
  gotoPage(1);
}

function lastPage() {
  gotoPage(totalPages.value);
}

const pagerRange = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxButtons = 7;
  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);

  const range = [];
  const half = Math.floor(maxButtons / 2);
  let start = current - half;
  let end = current + half;

  if (start < 1) {
    start = 1;
    end = maxButtons;
  } else if (end > total) {
    end = total;
    start = total - maxButtons + 1;
  }

  for (let i = start; i <= end; i++) range.push(i);
  return range;
});

const isFirst = computed(() => currentPage.value === 1);
const isLast = computed(() => currentPage.value === totalPages.value);
</script>

<template>
  <section class="recent-posts-view">
    <h1>최근 게시글 전체 목록</h1>

    <div class="card">
      <div class="table-wrap" role="region" aria-label="최근 게시글 목록">
        <table class="posts-table">
          <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col">제목</th>
              <th scope="col">카테고리</th>
              <th scope="col">수정일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(post, idx) in pagedPosts" :key="post.contentid ?? (idx + (currentPage-1)*pageSize)">
              <td class="num">{{ (currentPage - 1) * pageSize + idx + 1 }}</td>

              <td class="title">
                <router-link
                  :to="{ name: 'post-detail', params: { id: post.contentid } }"
                  class="title-link"
                >
                  {{ post.title }}
                </router-link>
              </td>

              <td class="category">{{ post.categoryName }}</td>
              <td class="date">{{ formatDate(post.modifiedtime) }}</td>
            </tr>

            <tr v-if="allRecentPosts.length === 0">
              <td colspan="4" class="empty">게시글이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav class="pagination" aria-label="페이지 네비게이션" v-if="totalPages > 1">
        <div class="pager-left">
          <button class="pager-btn" @click="firstPage" :disabled="isFirst" aria-label="맨 앞으로"><<</button>
          <button class="pager-btn" @click="prevPage" :disabled="isFirst" aria-label="이전 페이지"><</button>
        </div>

        <ul class="pager-list" role="list">
          <li v-for="p in pagerRange" :key="p">
            <button
              class="pager-number"
              :class="{ active: p === currentPage }"
              @click="gotoPage(p)"
              :aria-current="p === currentPage ? 'page' : null"
            >
              {{ p }}
            </button>
          </li>
        </ul>

        <div class="pager-right">
          <button class="pager-btn" @click="nextPage" :disabled="isLast" aria-label="다음 페이지">></button>
          <button class="pager-btn" @click="lastPage" :disabled="isLast" aria-label="맨 마지막으로">>></button>
        </div>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.recent-posts-view {
  padding: 20px;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(12,12,12,0.06);
  padding: 18px;
  max-width: 1100px;
  margin: 0 auto;
}

.table-wrap {
  overflow-x: auto;
}

.posts-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}

.posts-table thead th {
  text-align: left;
  font-weight: 600;
  padding: 12px 16px;
  color: #444;
  border-bottom: 1px solid #eee;
}

.posts-table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  color: #333;
}

.title-link {
  color: #1f2937;
  text-decoration: none;
  font-weight: 500;
}

.title-link:hover {
  text-decoration: underline;
}

.num { width: 64px; color:#666; }
.title { width: 60%; font-weight:500; }
.category { width: 160px; color:#666; }
.date { width: 160px; color:#888; }

.empty {
  text-align: center;
  padding: 18px;
  color: #777;
}

@media (max-width: 720px) {
  .card { padding: 12px; }
  .posts-table thead th, .posts-table tbody td { padding: 10px 12px; }
}
</style>