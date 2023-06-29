
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        name: 'HomePage',
      },
      {
        path: 'map',
        component: () => import('pages/MapPage/index.vue'),
        children: [
          {
            name: 'NoMapPage',
            path: '',
            component: () => import('pages/MapPage/NoMapPage.vue'),
          },
        ],
      },
      {
        path: 'user-management',
        component: () => import('pages/UserManagementPage.vue'),
        meta: {
          authRequired: true,
        },
      },
      {
        path: 'projection-management',
        component: () => import('pages/ProjectionManagementPage.vue'),
        meta: {
          authRequired: true,
        },
      },
      {
        path: 'location-management',
        component: () => import('pages/locationManagementPage.vue'),
        meta: {
          authRequired: true,
        },
      },
      { path: 'profile', component: () => import('pages/ProfilePage/index.vue') },
      // { path: 'logout', component: () => import('pages/LogoutPage.vue') },
    ]
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage/index.vue'),
    name: 'LoginPage',
    meta: {
      public: true,
    },
  },
  {
    path: '/register',
    component: () => import('pages/LoginPage/RegisterPage.vue'),
    name: 'RegisterPage',
    meta: {
      public: true,
    },
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
