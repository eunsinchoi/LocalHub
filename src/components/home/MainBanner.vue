<script setup>
import { onMounted, ref } from 'vue'
import { getRandomItems } from '../../services/localDataService.js'

const bannerItem = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

async function loadBannerItem() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const items = await getRandomItems(
      'tourist',
      1,
      {
        imageOnly: true,
      },
    )

    bannerItem.value = items[0] || null
  } catch (error) {
    console.error(
      '메인 배너 데이터를 불러오지 못했습니다.',
      error,
    )

    errorMessage.value =
      '서울 관광 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadBannerItem()
})
</script>

<template>
  <section class="main-banner">
    <div class="banner-content">
      <div class="banner-text-area">
        <p class="banner-label">
          서울 지역 정보 커뮤니티
        </p>

        <h1 class="banner-title">
          서울의 모든 정보,<br />
          함께 나누는 공간
        </h1>

        <p class="banner-description">
          여행으로 자유롭게 정보를 공유하고<br />
          유용한 정보를 찾아보세요.
        </p>

        <RouterLink
          to="/board/tourist"
          class="detail-button"
        >
          자세히 보기
        </RouterLink>

        <div
          v-if="bannerItem"
          class="place-information"
        >
          <strong class="place-title">
            {{ bannerItem.title }}
          </strong>

          <span
            v-if="bannerItem.address"
            class="place-address"
          >
            {{ bannerItem.address }}
          </span>
        </div>
      </div>

      <div class="banner-image-area">
        <div
          v-if="isLoading"
          class="banner-state"
        >
          관광 정보를 불러오는 중입니다.
        </div>

        <div
          v-else-if="errorMessage"
          class="banner-state"
        >
          {{ errorMessage }}
        </div>

        <img
          v-else-if="bannerItem?.image"
          :src="bannerItem.image"
          :alt="`${bannerItem.title} 대표 이미지`"
          class="banner-image"
        />

        <div
          v-else
          class="banner-state"
        >
          서울의 다양한 명소를 만나보세요.
        </div>

        <div class="image-overlay"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.main-banner {
  width: 100%;
  padding: 32px 24px 0;
}

.banner-content {
  position: relative;

  display: grid;
  grid-template-columns: 44% 56%;

  width: 100%;
  max-width: 1280px;
  min-height: 340px;
  margin: 0 auto;

  overflow: hidden;

  background: #f2f2f2;
  border-radius: 2px;
}

.banner-text-area {
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 48px 28px 48px 56px;
}

.banner-label {
  margin: 0 0 12px;

  color: #c8323e;
  font-size: 14px;
  font-weight: 700;
}

.banner-title {
  margin: 0;

  color: #202020;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -1.5px;
}

.banner-description {
  margin: 18px 0 24px;

  color: #666666;
  font-size: 15px;
  line-height: 1.7;
}

.detail-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: fit-content;
  min-width: 108px;
  height: 38px;
  padding: 0 18px;

  color: #c8323e;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  background: transparent;
  border: 1px solid #c8323e;
  border-radius: 3px;

  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.detail-button:hover {
  color: #ffffff;
  background: #c8323e;
}

.place-information {
  display: flex;
  flex-direction: column;
  gap: 4px;

  margin-top: 22px;
}

.place-title {
  color: #333333;
  font-size: 14px;
}

.place-address {
  display: block;
  max-width: 340px;

  overflow: hidden;

  color: #777777;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-image-area {
  position: relative;

  min-width: 0;
  min-height: 340px;

  overflow: hidden;
  background: #dedede;
}

.banner-image {
  display: block;

  width: 100%;
  height: 100%;
  min-height: 340px;

  object-fit: cover;
}

.banner-state {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  min-height: 340px;
  padding: 24px;

  color: #777777;
  font-size: 14px;
  text-align: center;
}

.image-overlay {
  position: absolute;
  inset: 0;

  pointer-events: none;

  background:
    linear-gradient(
      90deg,
      #f2f2f2 0%,
      rgba(242, 242, 242, 0.82) 8%,
      rgba(242, 242, 242, 0) 32%
    );
}

@media (max-width: 900px) {
  .banner-content {
    grid-template-columns: 1fr 1fr;
    min-height: 300px;
  }

  .banner-text-area {
    padding: 40px 24px 40px 36px;
  }

  .banner-title {
    font-size: 32px;
  }

  .banner-image-area,
  .banner-image,
  .banner-state {
    min-height: 300px;
  }
}

@media (max-width: 680px) {
  .main-banner {
    padding: 20px 16px 0;
  }

  .banner-content {
    display: flex;
    flex-direction: column;

    min-height: auto;
  }

  .banner-text-area {
    padding: 36px 24px;
  }

  .banner-title {
    font-size: 29px;
  }

  .banner-description br {
    display: none;
  }

  .banner-image-area,
  .banner-image,
  .banner-state {
    min-height: 220px;
    height: 220px;
  }

  .image-overlay {
    background:
      linear-gradient(
        180deg,
        #f2f2f2 0%,
        rgba(242, 242, 242, 0) 25%
      );
  }
}
</style>