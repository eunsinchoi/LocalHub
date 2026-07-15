<script setup>
defineProps({
  posts: {
    type: Array,
    default: () => [
      {
        id: 10,
        title: '관광지 주변 맛집 추천해요',
        createdAt: '2026-07-14',
      },
      {
        id: 9,
        title: '야경이 정말 예뻤던 곳이었어요',
        createdAt: '2026-07-12',
      },
      {
        id: 8,
        title: '주말에 가기 좋은 코스 공유합니다',
        createdAt: '2026-07-09',
      },
    ],
  },
})
</script>

<template>
  <div class="post-table-wrapper">
    <table class="post-table">
      <colgroup>
        <col class="number-column" />
        <col />
        <col class="date-column" />
      </colgroup>

      <thead>
        <tr>
          <th scope="col">번호</th>
          <th scope="col">제목</th>
          <th scope="col">작성일자</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="post in posts"
          :key="post.id"
        >
          <td class="post-id">
            {{ post.id }}
          </td>

          <td class="post-title-cell">
            <RouterLink
              :to="{
                name: 'post-detail',
                params: {
                  id: post.id,
                },
              }"
              class="post-title-link"
            >
              {{ post.title }}
            </RouterLink>
          </td>

          <td class="post-date">
            {{ post.createdAt }}
          </td>
        </tr>

        <tr v-if="posts.length === 0">
          <td
            colspan="3"
            class="empty-message"
          >
            게시글이 없습니다.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.post-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.post-table {
  width: 100%;
  min-width: 650px;

  background: #ffffff;
  border-collapse: collapse;
  table-layout: fixed;
}

.number-column {
  width: 80px;
}

.date-column {
  width: 160px;
}

.post-table th,
.post-table td {
  padding: 16px;

  text-align: left;
  vertical-align: middle;

  border-bottom: 1px solid #ececec;
}

.post-table th {
  color: #333333;
  font-size: 14px;
  font-weight: 700;

  background: #f7f7f7;
}

.post-table tbody tr {
  transition: background-color 0.2s ease;
}

.post-table tbody tr:hover {
  background: #fff8f8;
}

.post-id {
  color: #666666;
  font-size: 14px;
  font-weight: 600;
}

.post-title-cell {
  min-width: 0;
}

.post-title-link {
  display: block;

  overflow: hidden;

  color: #222222;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-title-link:hover {
  color: #c8323e;
  text-decoration: underline;
}

.post-date {
  color: #777777;
  font-size: 14px;
}

.empty-message {
  padding: 48px 16px !important;

  color: #888888;
  text-align: center !important;
}

@media (max-width: 720px) {
  .post-table th,
  .post-table td {
    padding: 13px 12px;
  }
}
</style>