<template>
    <div ref="chartContainer" class="chart-container"></div>
</template>

<script>
import * as d3 from 'd3';

export default {
    name: 'ZoomableAreaChart',
    data() {
        return {
            data: [
                { date: new Date(2000, 0, 1), value: 150 },
                { date: new Date(2000, 0, 20), value: 160 },
                { date: new Date(2000, 1, 1), value: 200 },
                { date: new Date(2000, 2, 1), value: 170 },
                { date: new Date(2000, 3, 1), value: 240 },
                { date: new Date(2000, 4, 1), value: 300 },
                { date: new Date(2000, 5, 1), value: 250 },
                { date: new Date(2000, 6, 1), value: 280 },
                { date: new Date(2000, 7, 1), value: 350 },
                { date: new Date(2000, 8, 1), value: 400 },
                { date: new Date(2000, 9, 1), value: 380 },
                { date: new Date(2000, 10, 1), value: 450 },
                { date: new Date(2000, 11, 1), value: 500 }
            ]
        };
    },
    mounted() {
        this.createChart();
    },
    beforeDestroy() {
        this.removeChart();
    },
    methods: {
        createChart() {
            const data = this.data;

            // Set up chart dimensions
            const width = 928;
            const height = 500;
            const marginTop = 20;
            const marginRight = 20;
            const marginBottom = 30;
            const marginLeft = 30;

            // Create scales
            const x = d3.scaleUtc()
                .domain(d3.extent(data, d => d.date))
                .range([marginLeft, width - marginRight]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value)]).nice()
                .range([height - marginBottom, marginTop]);

            // Create horizontal axis
            const xAxis = (g, x) => g
                .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

            // Create area generator
            const area = (data, x) => d3.area()
                .curve(d3.curveStepAfter)
                .x(d => x(d.date))
                .y0(y(0))
                .y1(d => y(d.value))(data);

            // Create zoom behavior
            const zoom = d3.zoom()
                .scaleExtent([1, 32])
                .extent([[marginLeft, 0], [width - marginRight, height]])
                .translateExtent([[marginLeft, -Infinity], [width - marginRight, Infinity]])
                .on('zoom', zoomed);

            // Create SVG container
            const svg = d3.select(this.$refs.chartContainer)
                .append('svg')
                .attr('viewBox', [0, 0, width, height])
                .attr('width', width)
                .attr('height', height)
                .attr('style', 'max-width: 100%; height: auto;');

            // Create clip-path
            const clipId = `clip-${Math.random().toString(36).substring(2, 9)}`;

            svg.append('clipPath')
                .attr('id', clipId)
                .append('rect')
                .attr('x', marginLeft)
                .attr('y', marginTop)
                .attr('width', width - marginLeft - marginRight)
                .attr('height', height - marginTop - marginBottom);

            // Create area
            const path = svg.append('path')
                .attr('clip-path', `url(#${clipId})`)
                .attr('fill', 'steelblue')
                .attr('d', area(data, x));

            // Append horizontal axis
            const gx = svg.append('g')
                .attr('transform', `translate(0,${height - marginBottom})`)
                .call(xAxis, x);

            // Append vertical axis
            svg.append('g')
                .attr('transform', `translate(${marginLeft},0)`)
                .call(d3.axisLeft(y).ticks(null, 's'))
                .call(g => g.select('.domain').remove())
                .call(g => g.select('.tick:last-of-type text').clone()
                    .attr('x', 3)
                    .attr('text-anchor', 'start')
                    .attr('font-weight', 'bold')
                    .text('Flights'));

            // Zoom function
            function zoomed(event) {
                const xz = event.transform.rescaleX(x);
                path.attr('d', area(data, xz));
                gx.call(xAxis, xz);
            }

            // Initial zoom
            svg.call(zoom)
                .transition()
                .duration(750)
                .call(zoom.scaleTo, 4, [x(Date.UTC(2001, 8, 1)), 0]);
        },
        removeChart() {
            d3.select(this.$refs.chartContainer).selectAll('*').remove();
        }
    }
};
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: 500px;
}
</style>