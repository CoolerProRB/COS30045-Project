<template>
    <NavBar />

    <div class="w-full">
        <router-view></router-view>
    </div>

    <footer class="flex flex-col gap-2 py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200 dark:border-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">
            © {{ new Date().getFullYear() }} Analysis of Respiratory Cancer. All rights reserved.
        </p>
    </footer>
</template>

<script>
import NavBar from "@/components/NavBar.vue";

export default {
    components: {NavBar},
    data() {
        return {
            theme: localStorage.getItem('theme') || 'light',
        };
    },
    mounted() {
        if (this.theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    }
};
</script>

<style>

</style>