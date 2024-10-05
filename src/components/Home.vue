<template>
    <h1 class="text-3xl">Home Page</h1>
    <p>Hello, {{ user }}!</p>
</template>

<script>
export default {
    name: 'Home',
    mounted() {
        document.title = 'Home';
    },
    data() {
        return {
            user: 'World'
        }
    },
};
</script>

<style>

</style>