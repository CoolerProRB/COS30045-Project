<template>
    <section class="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex justify-center">
        <div class="container px-4 md:px-6">
            <div class="flex flex-col items-center space-y-4 text-center">
                <div class="space-y-2">
                    <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                        Analysis of Respiratory Cancer
                    </h1>
                    <h1 class="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl/none">
                        (2000-2012)
                    </h1>
                    <p class="mx-auto w-8/12 text-gray-500 md:text-xl dark:text-gray-400">
                        Imagine a world where each breath tells a story. Welcome to "Breathing Through the Years," an interactive exploration of respiratory cancer's impact across six nations from 2000 to 2012.
                        This journey will take you through the landscapes of incidence and mortality, revealing patterns, uncovering disparities, and highlighting the human stories behind the numbers. As you scroll,
                        each visualization will unfold a new chapter, bringing data to life and shedding light on the challenges and triumphs in the fight against respiratory cancer.
                    </p>
                </div>
                <div class="space-x-4">
                    <button onclick="location.href='#learn-more'" class="border border-gray-400 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-700 dark:text-gray-50 dark:border-gray-700 py-2 px-4 rounded">Learn
                        More
                    </button>
                </div>
            </div>
        </div>
    </section>

    <section class="w-full py-12 md:py-24 lg:py-12 bg-gray-100 dark:bg-gray-800" id="learn-more">
        <MapChart />
    </section>

    <section class="w-full py-12 md:py-24 lg:py-12">
        <LineChart />
    </section>

    <section class="w-full py-12 md:py-24 lg:py-12 bg-gray-100 dark:bg-gray-800">
        <RacingChart />
    </section>

    <section class="w-full py-12 md:py-24 lg:py-12">
        <BarChart />
    </section>

    <section class="w-full py-12 md:py-24 lg:py-12 bg-gray-100 dark:bg-gray-800">
        <StackedBarChart />
    </section>
</template>

<script>
import MapChart from "@/components/MapChart.vue";
import LineChart from "@/components/LineChart.vue";
import BarChart from "@/components/BarChart.vue";
import StackedBarChart from "@/components/StackedBarChart.vue";
import RacingChart from "@/components/RacingChart.vue";

export default {
    name: 'Home',
    components: {
        MapChart,
        LineChart,
        BarChart,
        StackedBarChart,
        RacingChart
    },
    mounted() {
        document.title = 'Home';
    }
};
</script>

<style>

</style>