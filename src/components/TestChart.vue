<template>
    <div ref="chart"></div>
</template>

<script>
import * as d3 from 'd3';
import eventBus from '@/eventBus';

export default{
    mounted() {
        this.drawChart();
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
    },
    methods: {
        drawChart(){
            let width = 500;
            let height = 300;

            let data = [1, 2, 3, 4, 5];

            let theme = localStorage.getItem('theme') || 'light';

            let color = theme === 'dark' ? 'white' : 'black';

            const svg = d3.select(this.$refs.chart)
                .append('svg')
                // .attr('class', 'chart')
                .attr('width', width)
                .attr('height', height);

            svg.selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('x', (d, i) => i * (width / data.length) + 1)
                .attr('y', (d, i) => height - 10 * d)
                .attr('width', width / data.length - 2)
                .attr('height', (d, i) => d * 10)
                .attr('fill', color);
        },
        updateChartColor() {
            let theme = localStorage.getItem('theme') || 'light';
            let color = theme === 'dark' ? 'white' : 'black';

            const svg = d3.select(this.$refs.chart).select('svg');

            svg.selectAll('rect')
                .transition()
                .duration(200)
                .attr('fill', color);
        }
    }
}
</script>

<style>

</style>