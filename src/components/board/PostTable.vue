<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PasswordModal from '../common/PasswordModal.vue'
import CommentSection from './CommentSection.vue'

const route = useRoute()
const post = ref(null)
const isLoading = ref(true)
const error = ref('')

const fileData = [
  { name: '서울_관광지.json', cat: '관광지' },
  { name: '서울_레포츠.json', cat: '레포츠' },
  { name: '서울_문화시설.json', cat: '문화시설' },
  { name: '서울_쇼핑.json', cat: '쇼핑' },
  { name: '서울_숙박.json', cat: '숙박' },
  { name: '서울_여행코스.json', cat: '여행코스' },
  { name: '서울_축제공연행사.json', cat: '축제공연' }
]

function formatDate(modifiedtime) {
  if (!modifiedtime) return ''
  const s = String(modifiedtime)
  if (s.length >= 8) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`
  return s
}

onMounted(async () => {
  const id = route.params.id
  if (!id) {
    error.value = '잘못된 게시글입니다.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    for (const f of fileData) {
      try {
        const res = await fetch(`/data/${f.name}`)
        if (!res.ok) continue
        const data = await res.json()
        if (!data || !Array.isArray(data.items)) continue

        const found = data.items.find(
          (it) => String(it.contentid) === String(id),
        )
        if (found) {
          post.value = { ...found, categoryName: f.cat }
          break
        }
      } catch (e) {
        // ignore single-file errors, continue others
        // eslint-disable-next-line no-console
        console.error('파일 로드 실패', f.name, e)
      }
    }

    if (!post.value) {
      error.value = '게시글을 찾을 수 없습니다.'
    }
  } catch (e) {
    error.value = '게시글을 불러오는 중 오류가 발생했습니다.'
    // eslint-disable-next-line no-console
    console.error(e)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="post-detail-view">
    <div v-if="isLoading" class="state">게시글을 불러오는 중입니다...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <article v-else-if="post" class="post-card">
      <header class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-meta">
          <span class="category" v-if="post.categoryName">{{ post.categoryName }}</span>
          <span class="date">{{ formatDate(post.modifiedtime) }}</span>
        </div>
      </header>

      <div class="post-body">
        <figure v-if="post.firstimage || post.firstimage2" class="post-image">
          <img :src="post.firstimage || post.firstimage2" :alt="post.title" />
        </figure>

        <dl class="post-info">
          <div class="info-row" v-if="post.addr1 || post.addr2">
            <dt>주소</dt>
            <dd>{{ [post.addr1, post.addr2].filter(Boolean).join(' ') }}</dd>
          </div>
          <div class="info-row" v-if="post.tel">
            <dt>전화</dt>
            <dd>{{ post.tel }}</dd>
          </div>
          <div class="info-row" v-if="post.modifiedtime">
            <dt>수정일</dt>
            <dd>{{ formatDate(post.modifiedtime) }}</dd>
          </div>
        </dl>
      </div>
    </article>

    <CommentSection v-if="post" />
    <PasswordModal />
  </div>
</template>

<style scoped>
.post-detail-view {
  padding: 20px;
  max-width: 960px;
  margin: 0 auto;
}

.state {
  padding: 24px;
  text-align: center;
  color: #666;
}

.state.error {
  color: #b00020;
}

.post-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(12,12,12,0.06);
  margin-bottom: 18px;
}

.post-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.post-title {
  margin: 0;
  font-size: 22px;
  color: #111;
}

.post-meta {
  display: flex;
  gap: 12px;
  color: #777;
  font-size: 13px;
  align-items: center;
}

.post-image {
  margin: 12px 0;
  display: block;
}

.post-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.post-info {
  margin-top: 8px;
  display: grid;
  gap: 8px;
}

.info-row {
  display: flex;
  gap: 12px;
}

dt {
  min-width: 54px;
  color: #666;
  font-weight: 600;
}

dd {
  margin: 0;
  color: #333;
}
</style>