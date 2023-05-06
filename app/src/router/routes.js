
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'map', component: () => import('pages/MapPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      // { path: 'logout', component: () => import('pages/LogoutPage.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
