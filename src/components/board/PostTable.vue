<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import PasswordModal from '../common/PasswordModal.vue'
import CommentSection from './CommentSection.vue'

const route = useRoute()

const post = ref(null)
const isLoading = ref(true)
const error = ref('')

const posts = [
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
]

onMounted(() => {
  const id = route.params.id

  if (!id) {
    isLoading.value = false
    return
  }

  post.value =
    posts.find(
      (item) =>
        String(item.id) === String(id),
    ) || null

  if (!post.value) {
    error.value = '게시글을 찾을 수 없습니다.'
  }

  isLoading.value = false
})
</script>

<template>
  <div class="board-page">
    <!-- 목록 -->
    <div class="post-table-wrapper">
      <table class="post-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성일자</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in posts"
            :key="item.id"
          >
            <td>{{ item.id }}</td>

            <td>
              <RouterLink
                :to="{
                  name: 'post-detail',
                  params: {
                    id: item.id,
                  },
                }"
              >
                {{ item.title }}
              </RouterLink>
            </td>

            <td>
              {{ item.createdAt }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 상세 -->
    <section
      v-if="route.params.id"
      class="post-detail-view"
    >
      <div v-if="isLoading">
        게시글을 불러오는 중입니다...
      </div>

      <div v-else-if="error">
        {{ error }}
      </div>

      <article v-else-if="post">
        <h1>{{ post.title }}</h1>
        <p>{{ post.createdAt }}</p>
      </article>

      <CommentSection
        v-if="post"
        :post-id="route.params.id"
      />

      <PasswordModal />
    </section>
  </div>
</template>

<style scoped>
.post-table-wrapper {
  width: 100%;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
}

.posts-table thead th {
  text-align: left;
  font-weight: 600;
  padding: 12px 16px;
  background: transparent;
  color: #444;
  border-bottom: 1px solid #eee;
}

.posts-table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
  color: #333;
}

.posts-table tbody tr:hover {
  background: rgba(255, 85, 85, 0.03);
  transform: translateY(-1px);
}

/* Column sizing */
.num {
  width: 64px;
  color: #666;
  text-align: left;
}

.post-detail-view {
  margin-top: 32px;
  padding: 20px;
  border: 1px solid #eeeeee;
}

.title-link:hover {
  text-decoration: underline;
}

.title {
  width: 60%;
  font-weight: 500;
}

.category {
  width: 160px;
  color: #666;
  text-align: left;
}

.date {
  width: 160px;
  color: #888;
  text-align: left;
}

/* Empty row */
.empty {
  text-align: center;
  padding: 18px;
  color: #777;
}

/* Responsive adjustments */
@media (max-width: 720px) {
  .card {
    padding: 12px;
  }
  .posts-table thead th,
  .posts-table tbody td {
    padding: 10px 12px;
  }
}
</style>