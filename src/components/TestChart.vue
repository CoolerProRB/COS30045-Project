<template>
    <div class="mx-auto my-5 w-11/12 flex justify-center" @click="handleEmptySpaceClick">
        <div ref="chart"></div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import eventBus from '@/eventBus';

export default{
    mounted() {
        this.drawChart();
        document.title = 'Test Chart';
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
    },
    methods: {
        drawChart(){
            // Sample hierarchical data
            const data = [
                {
                    name: "Category 1",
                    value: 100,
                    children: [
                        {
                            name: "Subcategory 1-1",
                            value: 40,
                            children: [
                                { name: "Subcategory 1-1-1", value: 20 },
                                { name: "Subcategory 1-1-2", value: 20 }
                            ]
                        },
                        { name: "Subcategory 1-2", value: 60 }
                    ]
                },
                {
                    name: "Category 2",
                    value: 80,
                    children: [
                        {
                            name: "Subcategory 2-1",
                            value: 50,
                            children: [
                                { name: "Subcategory 2-1-1", value: 25 },
                                { name: "Subcategory 2-1-2", value: 25 }
                            ]
                        },
                        { name: "Subcategory 2-2", value: 30 }
                    ]
                },
                {
                    name: "Category 3",
                    value: 120,
                    children: [
                        {
                            name: "Subcategory 3-1",
                            value: 70,
                            children: [
                                { name: "Subcategory 3-1-1", value: 35 },
                                { name: "Subcategory 3-1-2", value: 35 }
                            ]
                        },
                        {
                            name: "Subcategory 3-2",
                            value: 50,
                            children: [
                                { name: "Subcategory 3-2-1", value: 25 },
                                { name: "Subcategory 3-2-2", value: 25 }
                            ]
                        }
                    ]
                },
                {
                    name: "Category 4",
                    value: 90,
                    children: [
                        { name: "Subcategory 4-1", value: 45 },
                        { name: "Subcategory 4-2", value: 45 }
                    ]
                },
                {
                    name: "Category 5",
                    value: 110,
                    children: [
                        {
                            name: "Subcategory 5-1",
                            value: 60,
                            children: [
                                { name: "Subcategory 5-1-1", value: 30 },
                                { name: "Subcategory 5-1-2", value: 30 }
                            ]
                        },
                        { name: "Subcategory 5-2", value: 50 }
                    ]
                }
            ];

            const margin = { top: 20, right: 20, bottom: 30, left: 40 };
            const width = 800 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            const svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            let currentData = data;
            let previousDataStack = [];

            function drawChart(data) {
                const x = d3.scaleBand()
                    .domain(data.map(d => d.name))
                    .range([0, width])
                    .padding(0.2);

                const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.value)])
                    .nice()
                    .range([height, 0]);

                // Update axes with transitions
                svg.selectAll(".x-axis").remove();
                svg.selectAll(".y-axis").remove();

                svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", `translate(0, ${height})`)
                    .transition()
                    .duration(750)
                    .call(d3.axisBottom(x));

                svg.append("g")
                    .attr("class", "y-axis")
                    .transition()
                    .duration(750)
                    .call(d3.axisLeft(y));

                // Bind data to bars
                const bars = svg.selectAll(".bar")
                    .data(data, d => d.name);

                // Remove old bars
                bars.exit()
                    .transition()
                    .duration(750)
                    .attr("y", height)
                    .attr("height", 0)
                    .remove();

                // Update existing bars
                bars.transition()
                    .duration(750)
                    .attr("x", d => x(d.name))
                    .attr("y", d => y(d.value))
                    .attr("width", x.bandwidth())
                    .attr("height", d => height - y(d.value));

                // Add new bars
                bars.enter()
                    .append("rect")
                    .attr("class", "bar")
                    .attr("x", d => x(d.name))
                    .attr("y", height)
                    .attr("width", x.bandwidth())
                    .attr("height", 0)
                    .attr("fill", "steelblue")
                    .on("click", function (event, d) {
                        event.stopPropagation();
                        if (d.children) {
                            previousDataStack.push(currentData);
                            currentData = d.children;
                            drawChart(currentData);
                        }
                    })
                    .transition()
                    .duration(750)
                    .attr("y", d => y(d.value))
                    .attr("height", d => height - y(d.value));
            }

            this.handleEmptySpaceClick = () => {
                if (previousDataStack.length > 0) {
                    currentData = previousDataStack.pop();
                    drawChart(currentData);
                }
            };

            drawChart(currentData);
        },
        updateChartColor() {
            let theme = localStorage.getItem('theme') || 'light';
            let color = theme === 'dark' ? 'white' : 'black';

            const svg = d3.select(this.$refs.chart).select('svg');

            svg.selectAll('rect')
                .transition()
                .duration(200)
                .attr('fill', color);

            svg.selectAll('text')
                .transition()
                .duration(200)
                .attr('fill', color);

            svg.selectAll('.label')
                .transition()
                .duration(200)
                .attr('fill', color === 'black' ? 'white' : 'black');
        }
    }
}
</script>

<style>

</style>