<script setup>
const props = defineProps({
  posts: {
    type: Array,
    default: () => [],
  },

  startNumber: {
    type: Number,
    default: 0,
  },
})

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const dateText = String(value).trim()

  /*
   * TourAPI 원본 날짜
   * 예: 20260715153000
   */
  if (/^\d{8,14}$/.test(dateText)) {
    return [
      dateText.slice(0, 4),
      dateText.slice(4, 6),
      dateText.slice(6, 8),
    ].join('-')
  }

  /*
   * ISO 날짜
   * 예: 2026-07-15T15:30:00.000Z
   *
   * localDataService 날짜
   * 예: 2026-07-15 15:30
   */
  return dateText.slice(0, 10)
}

function getPostDate(post) {
  return (
    post.modifiedAt ||
    post.updatedAt ||
    post.createdAt ||
    post.date ||
    post.raw?.modifiedtime ||
    post.raw?.createdtime ||
    ''
  )
}

function getPostKey(post, index) {
  return (
    post.feedId ||
    `${post.source || 'unknown'}:${post.id || index}`
  )
}

function getPostDetailRoute(post) {
  return {
    name: 'post-detail',

    params: {
      id: post.id,
    },

    query: {
      source:
        post.source || '',
    },
  }
}
</script>

<template>
  <div class="post-table-wrap">
    <table class="post-table">
      <thead>
        <tr>
          <th
            scope="col"
            class="number-column"
          >
            No.
          </th>

          <th
            scope="col"
            class="title-column"
          >
            제목
          </th>

          <th
            scope="col"
            class="category-column"
          >
            카테고리
          </th>

          <th
            scope="col"
            class="author-column"
          >
            작성자
          </th>

          <th
            scope="col"
            class="date-column"
          >
            작성일
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(
            post,
            index
          ) in props.posts"
          :key="
            getPostKey(
              post,
              index,
            )
          "
          class="post-row"
        >
          <td class="number-cell">
            {{
              props.startNumber +
              index +
              1
            }}
          </td>

          <td class="title-cell">
            <RouterLink
              :to="
                getPostDetailRoute(
                  post,
                )
              "
              class="title-link"
            >
              <span
                v-if="
                  post.source ===
                  'user'
                "
                class="user-post-badge"
              >
                후기
              </span>

              <span class="post-title">
                {{
                  post.title ||
                  '제목 없음'
                }}
              </span>
            </RouterLink>
          </td>

          <td class="category-cell">
            {{
              post.category ||
              post.contentType ||
              '-'
            }}
          </td>

          <td class="author-cell">
            {{
              post.source ===
              'local'
                ? '한국관광공사'
                : post.nickname ||
                  post.author ||
                  '익명'
            }}
          </td>

          <td class="date-cell">
            {{
              formatDate(
                getPostDate(
                  post,
                ),
              )
            }}
          </td>
        </tr>

        <tr
          v-if="
            props.posts.length ===
            0
          "
        >
          <td
            colspan="5"
            class="empty-cell"
          >
            등록된 게시글이 없습니다.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.post-table-wrap {
  width: 100%;
  min-width: 760px;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.post-table th {
  height: 52px;
  padding: 0 14px;

  color: #444444;
  font-size: 14px;
  font-weight: 700;
  text-align: center;

  background-color: #fafafa;
  border-bottom: 1px solid #dddddd;
}

.post-table td {
  height: 58px;
  padding: 10px 14px;

  color: #555555;
  font-size: 14px;
  text-align: center;
  vertical-align: middle;

  border-bottom: 1px solid #eeeeee;
}

.post-row {
  transition:
    background-color 0.2s ease;
}

.post-row:hover {
  background-color: #fffafa;
}

.number-column {
  width: 76px;
}

.title-column {
  width: auto;
}

.category-column {
  width: 130px;
}

.author-column {
  width: 130px;
}

.date-column {
  width: 130px;
}

.number-cell {
  color: #888888;
}

.title-cell {
  overflow: hidden;
  text-align: left;
}

.title-link {
  display: flex;
  align-items: center;
  gap: 8px;

  min-width: 0;

  color: #222222;
  font-weight: 500;
  text-decoration: none;
}

.title-link:hover {
  color: #c8323e;
  text-decoration: underline;
}

.post-title {
  display: block;

  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-post-badge {
  flex-shrink: 0;

  padding: 3px 7px;

  color: #c8323e;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;

  background-color: #fff5f5;
  border: 1px solid #f0c6ca;
  border-radius: 4px;
}

.category-cell {
  color: #666666;
}

.author-cell {
  overflow: hidden;

  color: #777777;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-cell {
  color: #888888;
  white-space: nowrap;
}

.empty-cell {
  height: 160px !important;

  color: #888888 !important;
  text-align: center !important;
}

@media (max-width: 768px) {
  .post-table-wrap {
    min-width: 680px;
  }

  .post-table th,
  .post-table td {
    padding-right: 10px;
    padding-left: 10px;

    font-size: 13px;
  }

  .number-column {
    width: 62px;
  }

  .category-column {
    width: 110px;
  }

  .author-column {
    width: 110px;
  }

  .date-column {
    width: 112px;
  }
}
</style>