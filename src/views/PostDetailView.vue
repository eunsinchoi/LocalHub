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
        </dl>
      </div>
    </article>

    <CommentSection v-if="post" />
    <PasswordModal />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// 파일 경로가 다를 수 있으니 확인해주세요. 
// 같은 views 폴더 내라면 ./ 를, components 폴더에 있다면 ../components/.. 를 사용하세요.
import PasswordModal from '../components/common/PasswordModal.vue'
import CommentSection from '../components/board/CommentSection.vue'

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
  try {
    for (const f of fileData) {
      const res = await fetch(`/data/${f.name}`)
      if (!res.ok) continue
      const data = await res.json()
      if (!data || !Array.isArray(data.items)) continue

      const found = data.items.find((it) => String(it.contentid) === String(id))
      if (found) {
        post.value = { ...found, categoryName: f.cat }
        break
      }
    }
    if (!post.value) error.value = '게시글을 찾을 수 없습니다.'
  } catch (e) {
    error.value = '게시글을 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* 여기에 스타일을 그대로 두시면 됩니다 */
</style>