<script setup>
import seoulLogo from '../../seoul_logo.png'
import { categories } from '../../constants/categories.js'
</script>

<template>
  <header class="app-header">
    <div class="header-inner">

      <!-- 좌측 로고 -->
      <RouterLink to="/" class="logo-area">
        <img
          :src="seoulLogo"
          alt="서울 로고"
          class="seoul-logo"
        />

        <span class="service-name">
          LocalHub
        </span>
      </RouterLink>

      <!-- 우측 메뉴 -->
      <nav class="navigation">

        <RouterLink
          v-for="category in categories"
          :key="category.path"
          :to="category.path"
          class="nav-link"
        >
          {{ category.name }}
        </RouterLink>

        <!-- 북마크 -->
        <RouterLink
          to="/bookmarks"
          class="icon-link bookmark-link"
          aria-label="북마크"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M6 3.75A1.75 1.75 0 0 1 7.75 2h8.5A1.75 1.75 0 0 1 18 3.75V22l-6-3.75L6 22V3.75Z"
            />
          </svg>
        </RouterLink>

        <!-- 검색 -->
        <button
          type="button"
          class="icon-button"
          aria-label="검색"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path d="M20 20L16 16" />
          </svg>
        </button>

      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;

  width: 100%;
  height: 72px;

  background: white;
  border-bottom: 1px solid #e5e5e5;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;

  max-width: 1400px;
  height: 100%;

  margin: 0 auto;
  padding: 0 32px;
}

/* ---------------- 로고 ---------------- */

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;

  text-decoration: none;
}

.seoul-logo {
  width: 36px;
  height: 36px;

  object-fit: contain;
}

.service-name {
  color: #222;

  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

/* ---------------- 메뉴 ---------------- */

.navigation {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-link {
  position: relative;

  color: #333;
  font-size: 15px;
  font-weight: 500;

  text-decoration: none;

  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #c53030;
}

.nav-link.router-link-active {
  color: #c53030;
  font-weight: 700;
}

.nav-link.router-link-active::after {
  content: '';

  position: absolute;
  left: 0;
  bottom: -8px;

  width: 100%;
  height: 2px;

  background: #c53030;
}

/* ---------------- 아이콘 ---------------- */

.icon-link,
.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  padding: 0;

  color: #333;

  background: transparent;
  border: none;

  cursor: pointer;
}

.icon-link:hover,
.icon-button:hover {
  color: #c53030;
}

.icon-link svg,
.icon-button svg {
  width: 20px;
  height: 20px;

  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 북마크 페이지 활성화 시 */

.bookmark-link.router-link-active {
  color: #c53030;
}

.bookmark-link.router-link-active svg {
  fill: currentColor;
}

/* ---------------- 모바일 ---------------- */

@media (max-width: 1024px) {
  .navigation {
    gap: 18px;
  }

  .nav-link {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .header-inner {
    flex-direction: column;
    align-items: flex-start;

    height: auto;

    padding: 16px;
  }

  .navigation {
    width: 100%;
    overflow-x: auto;

    padding-top: 12px;
  }

  .nav-link {
    white-space: nowrap;
  }
}
</style>