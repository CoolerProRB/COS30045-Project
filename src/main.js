import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import App from './App.vue'
import Home from './components/Home.vue'
import TestChart from './components/TestChart.vue'
import MapChart from "@/components/MapChart.vue";
import './assets/index.css'

const routes = [
    { path: '/', component: Home },
    { path: '/test', component: TestChart },
    { path: '/map', component: MapChart },
    { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

const app = createApp(App);
app.use(router);
app.mount('#app')
