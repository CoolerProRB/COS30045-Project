import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import App from './App.vue'
import Home from './components/Home.vue'
import BarChart from './components/BarChart.vue'
import MapChart from "@/components/MapChart.vue";
import StackedAreaChart from "@/components/StackedAreaChart.vue";
import LineChart from "@/components/LineChart.vue";
import Heatmap from "@/components/Heatmap.vue";
import './assets/index.css'

const routes = [
    { path: '/', component: Home },
    { path: '/bar', component: BarChart },
    { path: '/map', component: MapChart },
    { path: '/stacked-area', component: StackedAreaChart },
    { path: '/line', component: LineChart },
    { path: '/heatmap', component: Heatmap },
    { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

const app = createApp(App);
app.use(router);
app.mount('#app')
