<script setup>
import {
  nextTick,
  ref,
} from 'vue'

import {
  Bot,
  Send,
  X,
} from 'lucide-vue-next'

import seoulLogo from '../../seoul_logo.png'

import {
  hasOpenAiApiKey,
  requestChatbotAnswer,
} from '../../services/chatbotService.js'

import {
  loadAllLocalData,
} from '../../services/localDataService.js'

import {
  getPosts,
} from '../../services/postStorageService.js'

import {
  searchItems,
} from '../../utils/search.js'

const isOpen = ref(false)
const inputMessage = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const messageArea = ref(null)

const messages = ref([
  {
    id: crypto.randomUUID(),
    role: 'assistant',

    content:
      '안녕하세요. LocalHub AI 도우미입니다.\n서울 관광지, 축제, 쇼핑, 여행코스 등에 대해 질문해 주세요.',
  },
])

function toggleChatbot() {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    scrollToBottom()
  }
}

async function scrollToBottom() {
  await nextTick()

  if (!messageArea.value) {
    return
  }

  messageArea.value.scrollTop =
    messageArea.value.scrollHeight
}

function addMessage(
  role,
  content,
) {
  messages.value.push({
    id: crypto.randomUUID(),
    role,
    content,
  })
}

async function safelyLoadLocalData() {
  try {
    return await loadAllLocalData()
  } catch (error) {
    console.error(
      '서울 JSON 로딩 오류:',
      error,
    )

    return []
  }
}

function safelyLoadPosts() {
  try {
    const posts = getPosts()

    return Array.isArray(posts)
      ? posts
      : []
  } catch (error) {
    console.error(
      '게시글 로딩 오류:',
      error,
    )

    return []
  }
}

function createFallbackAnswer(
  localResults,
  postResults,
) {
  if (
    localResults.length === 0 &&
    postResults.length === 0
  ) {
    return [
      '관련된 서울 지역 정보와 커뮤니티 게시글을 찾지 못했습니다.',
      '',
      '지역명이나 카테고리를 조금 더 구체적으로 입력해 주세요.',
    ].join('\n')
  }

  const lines = []

  if (localResults.length > 0) {
    lines.push(
      '서울 지역 데이터에서 다음 장소를 찾았습니다.',
      '',
    )

    localResults
      .slice(0, 5)
      .forEach(
        (item, index) => {
          lines.push(
            `${index + 1}. ${item.title}`,
            `카테고리: ${item.category || '분류 없음'}`,
            `주소: ${item.address || '주소 정보 없음'}`,
            '',
          )
        },
      )
  }

  if (postResults.length > 0) {
    lines.push(
      '관련 커뮤니티 게시글도 확인할 수 있습니다.',
      '',
    )

    postResults
      .slice(0, 5)
      .forEach(
        (post, index) => {
          lines.push(
            `${index + 1}. ${post.title}`,
            `카테고리: ${post.category || '기타'}`,
            '',
          )
        },
      )
  }

  return lines.join('\n').trim()
}

async function sendMessage() {
  const message =
    inputMessage.value.trim()

  if (
    !message ||
    isLoading.value
  ) {
    return
  }

  addMessage(
    'user',
    message,
  )

  inputMessage.value = ''
  errorMessage.value = ''
  isLoading.value = true

  await scrollToBottom()

  try {
    const [
      localData,
      posts,
    ] = await Promise.all([
      safelyLoadLocalData(),

      Promise.resolve(
        safelyLoadPosts(),
      ),
    ])

    const localResults =
      searchItems(
        localData,
        message,
        5,
      )

    const postResults =
      searchItems(
        posts,
        message,
        5,
      )

    let answer = ''

    if (hasOpenAiApiKey()) {
      try {
        answer =
          await requestChatbotAnswer(
            message,
            localResults,
            postResults,
          )
      } catch (error) {
        console.error(
          'LLM 답변 생성 오류:',
          {
            message:
              error?.message,

            status:
              error?.status,

            requestId:
              error?.requestId,
          },
        )

        answer =
          createFallbackAnswer(
            localResults,
            postResults,
          )
      }
    } else {
      answer =
        createFallbackAnswer(
          localResults,
          postResults,
        )
    }

    addMessage(
      'assistant',
      answer,
    )
  } catch (error) {
    console.error(
      '챗봇 전체 처리 오류:',
      error,
    )

    errorMessage.value =
      '질문을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false

    await scrollToBottom()
  }
}

function handleEnter(event) {
  if (event.shiftKey) {
    return
  }

  event.preventDefault()
  sendMessage()
}
</script>

<template>
  <Transition name="chatbot-window">
    <section
      v-if="isOpen"
      class="chatbot-panel"
      aria-label="LocalHub AI 챗봇"
    >
      <header class="chatbot-header">
        <div class="chatbot-title-area">
          <div class="chatbot-logo-box">
            <img
              :src="seoulLogo"
              alt=""
              class="chatbot-logo"
            />
          </div>

          <div>
            <strong class="chatbot-title">
              LocalHub AI 도우미
            </strong>

            <div class="chatbot-status">
              <span class="status-dot"></span>
              <span>서울 지역 안내</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="chatbot-close-button"
          aria-label="챗봇 닫기"
          @click="isOpen = false"
        >
          <X :size="21" />
        </button>
      </header>

      <div
        ref="messageArea"
        class="chatbot-message-area"
      >
        <div
          v-for="chatMessage in messages"
          :key="chatMessage.id"
          :class="[
            'message-row',
            `message-row--${chatMessage.role}`,
          ]"
        >
          <div
            v-if="
              chatMessage.role ===
              'assistant'
            "
            class="assistant-icon"
          >
            <Bot :size="17" />
          </div>

          <p
            :class="[
              'message-bubble',
              `message-bubble--${chatMessage.role}`,
            ]"
          >
            {{ chatMessage.content }}
          </p>
        </div>

        <div
          v-if="isLoading"
          class="message-row message-row--assistant"
        >
          <div class="assistant-icon">
            <Bot :size="17" />
          </div>

          <div
            class="message-bubble loading-bubble"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <p
          v-if="errorMessage"
          class="chatbot-error"
        >
          {{ errorMessage }}
        </p>
      </div>

      <div class="chatbot-guide">
        <span v-if="hasOpenAiApiKey()">
          서울 지역 정보를 질문해 보세요.
        </span>

        <span v-else>
          API 키가 설정되지 않았습니다.
        </span>
      </div>

      <form
        class="chatbot-input-area"
        @submit.prevent="sendMessage"
      >
        <textarea
          v-model="inputMessage"
          class="chatbot-input"
          rows="1"
          placeholder="메시지를 입력해 주세요."
          aria-label="챗봇 메시지 입력"
          @keydown.enter="handleEnter"
        ></textarea>

        <button
          type="submit"
          class="send-button"
          aria-label="메시지 전송"
          :disabled="
            !inputMessage.trim() ||
            isLoading
          "
        >
          <Send :size="19" />
        </button>
      </form>
    </section>
  </Transition>

  <button
    type="button"
    class="chatbot-floating-button"
    :class="{
      'chatbot-floating-button--open':
        isOpen,
    }"
    :aria-label="
      isOpen
        ? '챗봇 닫기'
        : '챗봇 열기'
    "
    @click="toggleChatbot"
  >
    <X
      v-if="isOpen"
      :size="27"
    />

    <Bot
      v-else
      :size="30"
    />

    <span
      v-if="!isOpen"
      class="floating-status-dot"
    ></span>
  </button>
</template>

<style scoped>
.chatbot-floating-button {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 1200;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 62px;
  height: 62px;
  padding: 0;

  color: #ffffff;
  background: #c8323e;
  border: none;
  border-radius: 50%;

  box-shadow:
    0 10px 24px rgba(111, 24, 31, 0.28),
    0 3px 8px rgba(0, 0, 0, 0.12);

  cursor: pointer;

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.chatbot-floating-button:hover {
  background: #c8323e;
  transform: translateY(-3px);
}

.chatbot-floating-button--open {
  background: #c8323e;
  transform: rotate(90deg);
}

.floating-status-dot {
  position: absolute;
  top: 5px;
  right: 5px;

  width: 12px;
  height: 12px;

  background: #48b96b;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

.chatbot-panel {
  position: fixed;
  right: 28px;
  bottom: 104px;
  z-index: 1190;

  display: flex;
  flex-direction: column;

  width: min(390px, calc(100vw - 32px));
  height: min(590px, calc(100vh - 140px));

  overflow: hidden;

  background: #ffffff;
  border: 1px solid #e3e3e3;
  border-radius: 18px;

  box-shadow:
    0 22px 55px rgba(0, 0, 0, 0.18),
    0 5px 16px rgba(0, 0, 0, 0.08);
}

.chatbot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 76px;
  padding: 14px 16px 14px 18px;

  color: #ffffff;

  background:
    linear-gradient(
      135deg,
      #c8323e 0%,
      #c8323e 100%
    );
}

.chatbot-title-area {
  display: flex;
  align-items: center;
  gap: 11px;
}

.chatbot-logo-box {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  background: #ffffff;
  border-radius: 12px;
}

.chatbot-logo {
  width: 27px;
  height: 27px;
  object-fit: contain;
}

.chatbot-title {
  display: block;
  margin-bottom: 5px;

  font-size: 15px;
  font-weight: 700;
}

.chatbot-status {
  display: flex;
  align-items: center;
  gap: 6px;

  color: rgba(255, 255, 255, 0.86);
  font-size: 11px;
}

.status-dot {
  width: 7px;
  height: 7px;

  background: #7be495;
  border-radius: 50%;
}

.chatbot-close-button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;
  padding: 0;

  color: #ffffff;

  background: rgba(255, 255, 255, 0.12);
  border: none;
  border-radius: 10px;

  cursor: pointer;
}

.chatbot-message-area {
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: 14px;

  overflow-y: auto;
  padding: 20px 16px;

  background: #f6f6f6;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-row--user {
  justify-content: flex-end;
}

.message-row--assistant {
  justify-content: flex-start;
}

.assistant-icon {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 30px;

  color: #c8323e;

  background: #ffffff;
  border: 1px solid #e2e2e2;
  border-radius: 50%;
}

.message-bubble {
  max-width: 78%;
  margin: 0;
  padding: 11px 13px;

  font-size: 13px;
  line-height: 1.65;
  white-space: pre-line;
  word-break: keep-all;

  border-radius: 14px;
}

.message-bubble--assistant {
  color: #333333;

  background: #ffffff;
  border: 1px solid #e3e3e3;
  border-bottom-left-radius: 4px;
}

.message-bubble--user {
  color: #ffffff;

  background: #c8323e;
  border-bottom-right-radius: 4px;
}

.loading-bubble {
  display: flex;
  align-items: center;
  gap: 5px;

  min-width: 55px;
  min-height: 39px;
}

.loading-bubble span {
  width: 6px;
  height: 6px;

  background: #999999;
  border-radius: 50%;

  animation:
    loading-dot
    1.2s
    infinite
    ease-in-out;
}

.loading-bubble span:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-bubble span:nth-child(3) {
  animation-delay: 0.3s;
}

.chatbot-error {
  margin: 0;
  padding: 10px 12px;

  color: #c8323e;
  font-size: 12px;

  background: #fff0f1;
  border: 1px solid #f2c8cc;
  border-radius: 8px;
}

.chatbot-guide {
  padding: 8px 16px;

  color: #777777;
  font-size: 11px;

  background: #ffffff;
  border-top: 1px solid #eeeeee;
}

.chatbot-input-area {
  display: flex;
  align-items: flex-end;
  gap: 9px;

  padding: 12px 14px 14px;

  background: #ffffff;
}

.chatbot-input {
  flex: 1;

  min-height: 44px;
  max-height: 110px;
  padding: 11px 13px;

  color: #333333;
  font-size: 13px;
  line-height: 1.5;

  resize: none;

  background: #f7f7f7;
  border: 1px solid #dedede;
  border-radius: 12px;
  outline: none;
}

.chatbot-input:focus {
  border-color: #c8323e;

  box-shadow:
    0 0 0 3px rgba(200, 50, 62, 0.1);
}

.send-button {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 44px;
  height: 44px;
  padding: 0;

  color: #ffffff;

  background: #c8323e;
  border: none;
  border-radius: 12px;

  cursor: pointer;
}

.send-button:disabled {
  color: #aaaaaa;

  background: #e8e8e8;
  cursor: not-allowed;
}

.chatbot-window-enter-active,
.chatbot-window-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.chatbot-window-enter-from,
.chatbot-window-leave-to {
  opacity: 0;

  transform:
    translateY(14px)
    scale(0.97);
}

@keyframes loading-dot {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  40% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

@media (max-width: 600px) {
  .chatbot-floating-button {
    right: 18px;
    bottom: 18px;

    width: 58px;
    height: 58px;
  }

  .chatbot-panel {
    right: 0;
    bottom: 0;

    width: 100%;
    height: 100%;

    border: none;
    border-radius: 0;
  }
}
</style>