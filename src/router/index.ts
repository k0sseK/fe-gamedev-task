import { createRouter, createWebHistory } from 'vue-router/auto'

const routes = [
    {
        path: '/',
        name: 'user-list',
        component: () => import('@/pages/UserList.vue')
    },
    {
        path: '/add',
        name: 'add-user',
        component: () => import('@/pages/User.vue'),
    },
    {
        path: '/edit/:id',
        name: 'edit-user',
        component: () => import('@/pages/User.vue'),
        props: (route: any) => ({ 
            firstname: route.query.firstname, 
            lastname: route.query.lastname,
            avatar: route.query.avatar
        })
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

export default router
