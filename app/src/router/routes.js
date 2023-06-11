
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'map',
        component: () => import('pages/MapPage/index.vue'),
        children: [
          {
            name: 'NoMapPage',
            path: '',
            component: () => import('pages/MapPage/NoMapPage.vue'),
          },
          {
            name: 'DetailPage',
            path: ':id',
            component: () => import('pages/MapPage/DetailPage.vue'),
          }
        ],
      },
      { path: 'user-management', component: () => import('pages/UserManagementPage.vue') },
      { path: 'location-management', component: () => import('pages/LocationManagementPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      // { path: 'logout', component: () => import('pages/LogoutPage.vue') },
    ]
  },
  { path: '/login', component: () => import('pages/LoginPage.vue') },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
