
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'map', component: () => import('pages/MapPage.vue') },
      { path: 'user-management', component: () => import('pages/UserManagementPage.vue') },
      { path: 'location-management', component: () => import('pages/LocationManagementPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      // { path: 'logout', component: () => import('pages/LogoutPage.vue') },
    ]
  },
  { path: '/login', component: () => import('pages/LoginPage.vue') },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
