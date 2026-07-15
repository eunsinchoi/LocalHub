import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import BoardListView from '../views/BoardListView.vue'
import PostDetailView from '../views/PostDetailView.vue'
import PostWriteView from '../views/PostWriteView.vue'
import PostEditView from '../views/PostEditView.vue'
import BookmarkView from '../views/BookmarkView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/board/:category', name: 'board-list', component: BoardListView },
  { path: '/posts/:id', name: 'post-detail', component: PostDetailView },
  { path: '/write/:category', name: 'post-write', component: PostWriteView },
  { path: '/posts/:id/edit', name: 'post-edit', component: PostEditView },
  { path: '/bookmarks', name: 'bookmarks', component: BookmarkView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
