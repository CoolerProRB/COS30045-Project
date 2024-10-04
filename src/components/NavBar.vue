<script setup>

</script>

<template>
    <nav>
        <ul>
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/about">About</router-link></li>
            <li><router-link to="/contact">Contact</router-link></li>
        </ul>

        <div class="min-h-screen p-4">
            <button @click="toggleTheme" class="py-2 px-4 mb-4 rounded bg-blue-500 text-white">
                Toggle Dark Mode
            </button>
        </div>
    </nav>
</template>

<style scoped>

</style>