<script setup>
</script>

<template>
  <div class="search-shell">
    <label class="search-box" for="board-search">
      <span class="search-icon" aria-hidden="true">🔎</span>
      <input
        id="board-search"
        type="text"
        placeholder="검색할 제목이나 내용을 입력하세요"
      />
      <span class="search-hint">검색</span>
    </label>
  </div>
</template>

<style scoped>
.search-shell {
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #d7d7d7;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-box:hover,
.search-box:focus-within {
  border-color: #c8323e;
  box-shadow: 0 0 0 3px rgba(239, 63, 54, 0.12);
}

.search-icon {
  font-size: 16px;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #333333;
  font-size: 15px;
}

.search-hint {
  color: #c8323e;
  font-weight: 700;
  white-space: nowrap;
}
.board-content {
  width: 100%;
  overflow: hidden;

  border-top: 2px solid #333333;
}
</style>
