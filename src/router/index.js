import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import HomeView from '../views/HomeView.vue'
import BoardListView from '../views/BoardListView.vue'
import PostDetailView from '../views/PostDetailView.vue'
import PostWriteView from '../views/PostWriteView.vue'
import PostEditView from '../views/PostEditView.vue'
import BookmarkView from '../views/BookmarkView.vue'
import RecentPostView from '../views/RecentPostView.vue'
import SearchResultView from '../views/SearchResultView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },

  {
    path: '/search',
    name: 'search-results',
    component: SearchResultView,
  },

  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: BookmarkView,
  },

  {
    path: '/recent-posts',
    name: 'recent-posts',
    component: RecentPostView,
  },

  /*
   * 글쓰기
   *
   * 예:
   * /board/tourist/write
   */
  {
    path: '/board/:category/write',
    name: 'post-write',
    component: PostWriteView,
  },

  /*
   * 게시글 수정
   *
   * 예:
   * /board/tourist/edit/게시글ID
   */
  {
    path: '/board/:category/edit/:id',
    name: 'post-edit',
    component: PostEditView,
  },

  /*
   * 카테고리 게시판
   *
   * 예:
   * /board/tourist
   */
  {
    path: '/board/:category',
    name: 'board-list',
    component: BoardListView,
  },

  /*
   * 게시글 상세
   *
   * 예:
   * /posts/게시글ID?source=user
   */
  {
    path: '/posts/:id',
    name: 'post-detail',
    component: PostDetailView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router