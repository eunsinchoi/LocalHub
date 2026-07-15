# LocalHub Vue 3 협업용 프로젝트 틀

상세 기능을 제외하고 파일 구조와 연결 관계만 작성한 프로젝트입니다.

## 실행

```bash
npm install
npm run dev
```

## 추천 역할 분담

### 팀원 A — 공통 UI 및 메인
- `src/components/common/`
- `src/components/home/`
- `src/views/HomeView.vue`
- `src/assets/styles/`

### 팀원 B — 게시판 CRUD
- `src/components/board/`
- `src/views/BoardListView.vue`
- `src/views/PostDetailView.vue`
- `src/views/PostWriteView.vue`
- `src/views/PostEditView.vue`
- `src/services/postStorageService.js`

### 팀원 C — JSON, 북마크, 챗봇
- `src/components/chatbot/`
- `src/views/BookmarkView.vue`
- `src/services/localDataService.js`
- `src/services/bookmarkService.js`
- `src/services/chatbotService.js`
- `src/utils/search.js`

## 공동 관리 권장 파일
- `src/App.vue`
- `src/main.js`
- `src/router/index.js`
- `package.json`
