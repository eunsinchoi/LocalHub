# LocalHub

서울 지역 관광 정보와 사용자 커뮤니티 게시글을 함께 제공하는 Vue 기반 웹 서비스입니다.

한국관광공사 TourAPI 기반 서울 지역 JSON 데이터를 활용하며, 카테고리별 정보 조회, 통합 검색, 게시글 작성·수정·삭제, 북마크, 최근 게시글, AI 안내 챗봇 기능을 제공합니다.

## 기술 스택

- Vue 3, Vue Router, Vite
- JavaScript
- Local Storage / Session Storage
- Netlify / Netlify Functions
- OpenAI Responses API
- lucide-vue-next

## 주요 기능

- 관광지·문화시설·축제공연·여행코스·레포츠·쇼핑 정보 조회
- 지역 데이터와 사용자 게시글 통합 검색
- 게시글 작성, 상세 조회, 수정, 삭제
- 게시글 비밀번호 확인
- 북마크, 좋아요, 최근 게시글
- OpenAI 기반 서울 지역 AI 안내 챗봇

## 1. 설치 방법

### 사전 준비

- Node.js 및 npm
- Git
- OpenAI API 키
- Netlify 계정

```bash
node -v
npm -v
git --version
```

### 프로젝트 설치

```bash
git clone <저장소 URL>
cd localhub
npm install
```

`vite: command not found` 오류가 발생하면 프로젝트 루트에서 `npm install`을 다시 실행합니다.

AI 챗봇과 Netlify Function을 로컬에서 함께 실행하려면 Netlify CLI도 설치합니다.

```bash
npm install --save-dev netlify-cli
npx netlify --version
```

## 2. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
OPENAI_API_KEY=발급받은_OpenAI_API_키
OPENAI_MODEL=사용할_OpenAI_모델명
```

`.env.example`은 실제 값을 비워 둔 상태로 작성합니다.

```env
OPENAI_API_KEY=
OPENAI_MODEL=
```

`OPENAI_MODEL`을 Netlify Function에서 사용하지 않는 경우에는 생략할 수 있습니다.

### 환경변수 주의사항

- 실제 API 키가 포함된 `.env` 파일은 Git에 커밋하지 않습니다.
- OpenAI API 키에 `VITE_` 접두사를 붙이지 않습니다.
- API 키는 `netlify/functions/openai.js`에서 `process.env.OPENAI_API_KEY`로 읽습니다.
- OpenAI 요청은 브라우저에서 직접 보내지 않고 Netlify Function을 통해 전달합니다.

`.gitignore` 예시:

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
.netlify/
```

## 3. 실행 방법

### Vue 화면만 실행

```bash
npm run dev
```

일반적인 접속 주소:

```text
http://localhost:5173
```

이 방법은 Vue 화면만 실행합니다. `/api/openai`를 처리하는 Netlify Function이 실행되지 않기 때문에 AI 챗봇은 실패할 수 있습니다.

### AI 챗봇까지 함께 실행

```bash
npx netlify dev
```

일반적인 접속 주소:

```text
http://localhost:8888
```

AI 챗봇을 테스트할 때는 Vite 주소가 아니라 `netlify dev`가 출력한 주소로 접속합니다.

기존 Netlify 사이트와 로컬 프로젝트를 연결하려면 최초 1회 다음 명령어를 실행합니다.

```bash
npx netlify login
npx netlify link
```

아직 Netlify 사이트가 없다면 다음 명령어로 초기화합니다.

```bash
npx netlify login
npx netlify init
```

## 4. Netlify 리다이렉트 설정

이 프로젝트는 Vue Router history 모드를 사용하므로 공유 링크로 직접 접속하거나 새로고침할 때 SPA 리다이렉트가 필요합니다.

또한 프런트엔드의 `/api/openai` 요청을 Netlify Function으로 전달해야 합니다.

`public/_redirects` 파일을 생성하고 다음 내용을 입력합니다.

```text
/api/openai /.netlify/functions/openai 200
/* /index.html 200
```

주의사항:

- API 리다이렉트가 SPA 리다이렉트보다 위에 있어야 합니다.
- 파일명은 `_redirects`이며 확장자를 붙이지 않습니다.
- 파일은 프로젝트 루트가 아니라 `public/_redirects`에 둡니다.
- Vite 빌드 시 `dist/_redirects`로 복사됩니다.

## 5. 빌드 방법

배포 전에 빌드가 정상적으로 완료되는지 확인합니다.

```bash
npm run build
```

빌드 결과는 기본적으로 `dist` 폴더에 생성됩니다.

정적 빌드 결과 확인:

```bash
npm run preview
```

`npm run preview`는 Netlify Function을 실행하지 않으므로 AI 챗봇 테스트에는 `npx netlify dev`를 사용합니다.

## 6. Netlify 배포 방법

### GitHub 연동 배포

1. 프로젝트를 GitHub 저장소에 push합니다.
2. Netlify에서 새 프로젝트를 생성하고 GitHub 저장소를 연결합니다.
3. 빌드 설정을 다음과 같이 입력합니다.

```text
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

4. Netlify 프로젝트의 환경변수 설정에서 다음 값을 등록합니다.

```text
OPENAI_API_KEY=실제_API_키
OPENAI_MODEL=사용할_모델명
```

5. 환경변수 범위를 선택할 수 있다면 Functions에서 사용할 수 있도록 설정합니다.
6. 배포를 실행합니다.
7. 환경변수를 추가하거나 변경했다면 새 배포를 실행합니다.

GitHub와 연결한 뒤에는 배포 브랜치에 push할 때 자동으로 다시 배포됩니다.

### Netlify CLI 배포

초안 배포:

```bash
npx netlify deploy --build
```

운영 배포:

```bash
npx netlify deploy --build --prod
```

## 7. 지역 데이터 파일

다음 파일이 `public/data` 폴더에 있어야 합니다.

```text
서울_관광지.json
서울_문화시설.json
서울_축제공연행사.json
서울_여행코스.json
서울_레포츠.json
서울_쇼핑.json
```

파일명, 띄어쓰기, 한글, 확장자가 코드에 작성된 경로와 정확히 일치해야 합니다.

## 8. 데이터 저장 방식

현재 사용자 데이터는 브라우저 저장소에 저장됩니다.

- 게시글, 북마크, 좋아요: `localStorage`
- 수정 권한 확인 정보: `sessionStorage`

따라서 다른 브라우저나 다른 기기에는 데이터가 공유되지 않습니다. 브라우저 저장 데이터를 삭제하면 작성한 게시글과 북마크도 삭제될 수 있습니다.

여러 사용자가 같은 데이터를 공유하려면 별도의 백엔드와 데이터베이스가 필요합니다.

## 9. 배포 후 확인

- `/board/tourist` 같은 주소로 직접 접속되는지
- 게시글 상세 링크를 새 창에서 열 수 있는지
- 새로고침 시 404 오류가 발생하지 않는지
- `/api/openai` 요청이 404로 실패하지 않는지
- AI 챗봇이 정상적으로 답변하는지
- Netlify 환경변수에 OpenAI API 키가 등록되어 있는지
- `public/data`의 JSON 파일이 모두 배포되었는지

## 10. 자주 발생하는 오류

### `vite: command not found`

```bash
npm install
npm run dev
```

### 공유 링크 또는 새로고침 시 404

`public/_redirects` 파일과 SPA 리다이렉트 설정을 확인합니다.

### AI 챗봇 요청이 404

- `netlify/functions/openai.js`가 존재하는지 확인합니다.
- `public/_redirects`의 `/api/openai` 규칙을 확인합니다.
- 로컬에서는 `npm run dev` 대신 `npx netlify dev`를 사용합니다.

### OpenAI API 키 오류

- 환경변수 이름이 `OPENAI_API_KEY`인지 확인합니다.
- `.env`에 불필요한 공백이나 따옴표가 없는지 확인합니다.
- Netlify 환경변수 변경 후 새 배포를 실행합니다.
- 프런트엔드 코드에 API 키를 직접 작성하지 않았는지 확인합니다.
