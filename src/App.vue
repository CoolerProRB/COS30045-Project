<template>
    <NavBar />

    <div class="w-full md:w-11/12 lg:w-10/12 mx-auto py-5 px-3 lg:px-0">
        <router-view></router-view>
    </div>
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