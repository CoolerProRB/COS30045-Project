<template>
    <div class="mx-auto my-5 w-11/12 flex justify-center" @click="handleEmptySpaceClick">
        <div ref="chart" class="bg-gray-100 dark:bg-gray-700 cursor-pointer"></div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import eventBus from '@/eventBus';
import $ from 'jquery';

export default{
    data() {
        return {
            isTransitioning: false,
            currentData: null,
            previousDataStack: [],
            colors: {
                light: {
                    bar_with_child: 'steelblue',
                    bar_without_child: 'slategray',
                    hover: 'lightsteelblue'
                },
                dark: {
                    bar_with_child: '#1c1c5d',
                    bar_without_child: 'slategray',
                    hover: '#25256b'
                }
            }
        };
    },
    mounted() {
        this.drawChart();
        document.title = 'Bar Chart';
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
                                {
                                    name: "Subcategory 5-1-2",
                                    value: 30,
                                    children: [
                                        { name: "Subcategory 5-1-2-1", value: 15 },
                                        { name: "Subcategory 5-1-2-2", value: 15 }
                                    ]
                                }
                            ]
                        },
                        { name: "Subcategory 5-2", value: 50 }
                    ]
                }
            ];

            let widthPercentage = 1;

            if (window.innerWidth < 768) {
                widthPercentage = 0.9;
            } else if (window.innerWidth < 1024) {
                widthPercentage = 0.8;
            } else if (window.innerWidth < 1280) {
                widthPercentage = 0.7;
            } else if (window.innerWidth < 1536) {
                widthPercentage = 0.6;
            } else {
                widthPercentage = 0.5;
            }

            const margin = { top: 20, right: 20, bottom: 30, left: 40 };
            const width = $(".w-11\\/12").width() * widthPercentage - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            d3.select(this.$refs.chart).selectAll("svg").remove(); // Remove existing SVG to avoid stacking old elements

            const svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            this.currentData = data;
            const vm = this;

            function drawChart(data) {
                const x = d3.scaleBand()
                    .domain(data.map(d => d.name))
                    .range([0, width])
                    .padding(0.2);

                const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.value)])
                    .nice()
                    .range([height, 0]);

                // Prevent interactions during transitions
                vm.isTransitioning = true;

                // Update axes with transitions
                svg.selectAll(".x-axis").remove();
                svg.selectAll(".y-axis").remove();

                svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", `translate(0, ${height})`)
                    .transition()
                    .duration(500)
                    .call(d3.axisBottom(x))
                    .on("end", () => {
                        vm.isTransitioning = false;
                    });

                svg.append("g")
                    .attr("class", "y-axis")
                    .transition()
                    .duration(500)
                    .call(d3.axisLeft(y))
                    .on("end", () => {
                        vm.isTransitioning = false;
                    });

                // Bind data to bars
                let bars = svg.selectAll(".bar")
                    .data(data, d => d.name);

                // Remove old bars and wait for them to disappear before drawing new bars
                bars.exit()
                    .transition()
                    .duration(500)
                    .attr("y", height)
                    .attr("height", 0)
                    .remove()
                    .on("end", function() {
                        // Redraw chart after old bars are completely removed
                        bars = svg.selectAll(".bar").data(data, d => d.name);
                        drawNewBars(bars, data);
                    });

                function drawNewBars(bars, data) {
                    // Update existing bars
                    bars.transition()
                        .duration(500)
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
                        .attr("fill", d => d.children ? vm.colors[localStorage.getItem('theme')].bar_with_child : vm.colors[localStorage.getItem('theme')].bar_without_child)
                        .style("cursor", d => d.children ? "pointer" : "default")
                        .on("click", function (event, d) {
                            if (!vm.isTransitioning && d.children) {
                                event.stopPropagation();
                                vm.previousDataStack.push(vm.currentData);
                                vm.currentData = d.children;
                                vm.isTransitioning = true;
                                drawChart(vm.currentData);
                            } else {
                                event.stopPropagation();
                            }
                        })
                        .on("mouseover", function (event, d) {
                            if (d.children) {
                                d3.select(this).attr("fill", vm.colors[localStorage.getItem('theme')].hover);
                            }
                        })
                        .on("mouseout", function (event, d) {
                            if (d.children) {
                                d3.select(this).attr("fill", d => d.children ? vm.colors[localStorage.getItem('theme')].bar_with_child : vm.colors[localStorage.getItem('theme')].bar_without_child);
                            }
                        })
                        .transition()
                        .duration(500)
                        .attr("y", d => y(d.value))
                        .attr("height", d => height - y(d.value))
                        .on("end", () => {
                            vm.isTransitioning = false;
                        });
                }

                // If no bars need to be removed, draw new bars immediately
                if (bars.exit().empty()) {
                    drawNewBars(bars, data);
                }
            }

            this.handleEmptySpaceClick = () => {
                if (!this.isTransitioning && this.previousDataStack.length > 0) {
                    this.currentData = this.previousDataStack.pop();
                    this.isTransitioning = true;
                    drawChart(this.currentData);
                }
            };

            drawChart(this.currentData);
        },
        updateChartColor() {
            let theme = localStorage.getItem('theme') || 'light';
            let color = theme === 'dark' ? 'white' : 'black';

            const svg = d3.select(this.$refs.chart).select('svg');

            svg.selectAll('rect')
                .transition()
                .duration(200)
                .attr('fill', d => d.children ? this.colors[theme].bar_with_child : this.colors[theme].bar_without_child);

            svg.selectAll('text')
                .transition()
                .duration(200)
                .attr('fill', color);

            svg.selectAll('.label')
                .transition()
                .duration(200)
                .attr('fill', color);
        }
    }
}
</script>

<style>

</style>