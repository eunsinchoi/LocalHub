I'll update RecentPostView.vue to the paginated version and ensure arrow controls work correctly.

Read [](file:///c%3A/Users/SSAFY/LocalHub/src/views/RecentPostView.vue)

Now I'll patch RecentPostView.vue to add `isFirst`/`isLast` computed flags and update pagination buttons to use them and show << < > >> labels.



Fetched [resource](file:///c:/Users/SSAFY/LocalHub/src/views/RecentPostView.vue)



Fetched [resource](file:///c:/Users/SSAFY/LocalHub/src/views/RecentPostView.vue)



Fetched [resource](file:///c:/Users/SSAFY/LocalHub/src/views/RecentPostView.vue)

Inserted into memory file [](file:///c%3A/Users/SSAFY/AppData/Roaming/Code/User/workspaceStorage/39cd41bceacf92f86d8014055aeeb430/GitHub.copilot-chat/memory-tool/memories/NDhlNGUzNDctNjY2Yi00MmFlLTlkZGEtMzUyYzAzODRkOTAz/pagination_change.md)

Read memory [](file:///c%3A/Users/SSAFY/AppData/Roaming/Code/User/workspaceStorage/39cd41bceacf92f86d8014055aeeb430/GitHub.copilot-chat/memory-tool/memories/NDhlNGUzNDctNjY2Yi00MmFlLTlkZGEtMzUyYzAzODRkOTAz/pagination_change.md)

Updated memory file [](file:///c%3A/Users/SSAFY/AppData/Roaming/Code/User/workspaceStorage/39cd41bceacf92f86d8014055aeeb430/GitHub.copilot-chat/memory-tool/memories/NDhlNGUzNDctNjY2Yi00MmFlLTlkZGEtMzUyYzAzODRkOTAz/pagination_change.md)



Fetched [resource](file:///c:/Users/SSAFY/LocalHub/src/views/RecentPostView.vue)



Fetched [resource](file:///c:/Users/SSAFY/LocalHub/src/views/RecentPostView.vue)



Fetched [resource](file:///c:/Users/SSAFY/LocalHub/src/views/RecentPostView.vue)

아래는 화살표(<<, <, >, >>)가 정상 동작하도록 수정한 RecentPostView.vue 전체 내용입니다 — 파일에 붙여넣어 적용하시면 됩니다.

```vue
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
  <section class="recent-posts-page">
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
              <td class="title">{{ post.title }}</td>
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
.recent-posts-page {
  padding: 20px;
}

h1 {
  margin: 0 0 14px 0;
  font-size: 20px;
  color: #222;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(12,12,12,0.06);
  padding: 18px;
  max-width: 1100px;
  margin: 0 auto;
}

/* Table */
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
  border-bottom: 1px solid #eee;
  color: #444;
}

.posts-table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  color: #333;
}

.posts-table tbody tr:hover {
  background: rgba(255,85,85,0.03);
}

/* columns */
.num { width: 64px; color:#666; }
.title { width: 60%; font-weight:500; }
.category { width: 160px; color:#666; }
.date { width: 160px; color:#888; }

/* Pagination layout */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 6px 0;
  flex-wrap: nowrap;
}

/* left/right groups */
.pager-left,
.pager-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* center page numbers */
.pager-list {
  display: flex;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 0 auto;
  align-items: center;
}

.pager-number,
.pager-btn {
  background: #fff;
  border: 1px solid #e6e6e6;
  color: #333;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  min-width: 40px;
  transition: background 120ms, transform 120ms, box-shadow 120ms;
}

.pager-number:hover,
.pager-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgba(12,12,12,0.06);
  background: #fff7f7;
}

.pager-number.active {
  background: #ff5555;
  color: #fff;
  border-color: #ff5555;
  transform: none;
  box-shadow: none;
}

.pager-btn[disabled],
.pager-number[disabled] {
  opacity: 0.5;
  cursor: default;
  transform: none;
  box-shadow: none;
}

/* small screens */
@media (max-width: 520px) {
  .pagination {
    gap: 8px;
    padding-top: 10px;
  }
  .pager-list {
    margin: 0 8px;
    gap: 4px;
  }
  .pager-number, .pager-btn { padding: 6px 8px; min-width: 34px; }
}

/* empty row */
.empty {
  text-align: center;
  padding: 18px;
  color: #777;
}
</style>
