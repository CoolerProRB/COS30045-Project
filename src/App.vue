<template>
    <NavBar />

    <div class="container mx-auto py-5">
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