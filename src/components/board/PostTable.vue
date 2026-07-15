<script setup>
const posts = [
  { id: 10, title: '관광지 주변 맛집 추천해요', createdAt: '2026-07-14' },
  { id: 9, title: '야경이 정말 예뻤던 곳이었어요', createdAt: '2026-07-12' },
  { id: 8, title: '주말에 가기 좋은 코스 공유합니다', createdAt: '2026-07-09' },
]
</script>

<template>
  <div class="post-table-wrapper">
    <table class="post-table">
      <thead>
        <tr>
          <th scope="col">번호</th>
          <th scope="col">제목</th>
          <th scope="col">작성일자</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post.id">
          <td class="post-id">{{ post.id }}</td>
          <td class="post-title">{{ post.title }}</td>
          <td class="post-date">{{ post.createdAt }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.post-table-wrapper {
  width: 100%;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
}

.post-table th,
.post-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #ececec;
  text-align: left;
}

.post-table th {
  background-color: #f7f7f7;
  color: #333333;
  font-size: 14px;
  font-weight: 700;
}

.post-id {
  width: 80px;
  color: #777777;
  font-weight: 600;
}

.post-title {
  color: #222222;
  font-weight: 600;
}

.post-date {
  width: 140px;
  color: #777777;
  font-weight: 500;
}
</style>