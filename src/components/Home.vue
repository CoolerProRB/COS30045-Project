<template>
    <section class="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex justify-center">
        <div class="container px-4 md:px-6">
            <div class="flex flex-col items-center space-y-4 text-center">
                <div class="space-y-2">
                    <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                        Cancer Data Visualization
                    </h1>
                    <p class="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                        Explore and understand cancer statistics through interactive visualizations. Our platform
                        provides
                        insights into various types of cancer, their prevalence, and trends over time.
                    </p>
                </div>
                <div class="space-x-4">
                    <button class="bg-gray-950 hover:bg-gray-700 text-gray-50 dark:bg-gray-50 dark:hover:bg-gray-100 dark:text-gray-800 py-2 px-4 rounded">Get
                        Started
                    </button>
                    <button class="border border-gray-400 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-700 dark:text-gray-50 dark:border-gray-700 py-2 px-4 rounded">Learn
                        More
                    </button>
                </div>
            </div>
        </div>
    </section>

    <section class="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800 flex justify-center">
        <div class="container px-4 md:px-6">
            <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
                Key Statistics
            </h2>
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div class="bg-white border border-gray-300 dark:border-none dark:bg-gray-950 rounded-lg p-8 h-52 flex justify-between flex-col">
                    <div>
                        <p class="font-bold text-3xl">Global Cancer Cases</p>
                        <span class="dark:text-gray-400 text-sm">Estimated new cases in 2020</span>
                    </div>
                    <div>
                        <p class="text-4xl font-bold">19.3 million</p>
                    </div>
                </div>
                <div class="bg-white border border-gray-300 dark:border-none dark:bg-gray-950 rounded-lg p-8 h-52 flex justify-between flex-col">
                    <div>
                        <p class="font-bold text-3xl">Cancer Deaths</p>
                        <span class="dark:text-gray-400 text-sm">Estimated deaths in 2020</span>
                    </div>
                    <div>
                        <p class="text-4xl font-bold">10 million</p>
                    </div>
                </div>
                <div class="bg-white border border-gray-300 dark:border-none dark:bg-gray-950 rounded-lg p-8 h-52 flex justify-between flex-col">
                    <div>
                        <p class="font-bold text-3xl">Most Common Cancer</p>
                        <span class="dark:text-gray-400 text-sm">Worldwide in 2020</span>
                    </div>
                    <div>
                        <p class="text-4xl font-bold">Breast Cancer</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="w-full py-12 md:py-24 lg:py-32 flex justify-center">
        <div class="container px-4 md:px-6">
            <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
                Explore Our Visualizations
            </h2>
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div class="border border-gray-300 dark:border-none dark:bg-gray-950 rounded-lg p-8 h-60 flex justify-between flex-col">
                    <div>
                        <p class="font-bold text-2xl">Cancer Types</p>
                        <span class="dark:text-gray-400 text-sm">Distribution of different cancer types</span>
                    </div>
                    <div class="flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                             class="lucide lucide-chart-pie-icon h-24 w-24 text-primary dark:text-primary-light">
                            <path
                                d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"></path>
                            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                        </svg>
                    </div>
                </div>
                <div class="border border-gray-300 dark:border-none dark:bg-gray-950 rounded-lg p-8 h-60 flex justify-between flex-col">
                    <div>
                        <p class="font-bold text-2xl">Incidence Rates</p>
                        <span class="dark:text-gray-400 text-sm">Cancer incidence rates over time</span>
                    </div>
                    <div class="flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                             class="lucide lucide-chart-line-icon h-24 w-24 text-primary dark:text-primary-light">
                            <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                            <path d="m19 9-5 5-4-4-3 3"></path>
                        </svg>
                    </div>
                </div>
                <div class="border border-gray-300 dark:border-none dark:bg-gray-950 rounded-lg p-8 h-60 flex justify-between flex-col">
                    <div>
                        <p class="font-bold text-2xl">Survival Rates</p>
                        <span class="dark:text-gray-400 text-sm">5-year survival rates by cancer type</span>
                    </div>
                    <div class="flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                             class="lucide lucide-chart-no-axes-column-increasing-icon h-24 w-24 text-primary dark:text-primary-light">
                            <line x1="12" x2="12" y1="20" y2="10"></line>
                            <line x1="18" x2="18" y1="20" y2="4"></line>
                            <line x1="6" x2="6" y1="20" y2="16"></line>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </section>
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