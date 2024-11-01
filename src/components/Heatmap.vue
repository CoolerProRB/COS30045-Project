<template>
    <div class="w-full text-center">
        <h1 class="text-5xl">Lives Lost: A Heatmap of Respiratory Cancer Mortality</h1>
    </div>
    <div class="w-6/12 mx-auto my-3 text-center">
        <p>
            Behind every statistic lies a human story. Our heat map brings these stories to the forefront, illustrating the stark reality of lives lost to respiratory cancer each year.
            As you gaze upon the vibrant colors, see the intensity of mortality rates across different countries and years. Peaks of red signify years when the toll was highest, while cooler
            tones hint at moments of relative respite. This visualization not only complements our incidence data but also paints a poignant picture of the human cost, urging us to reflect on the
            effectiveness of healthcare systems and the urgent need for continued advancements in treatment and prevention.
        </p>
    </div>
    <div class="mx-auto my-5 w-9/12 dark:bg-gray-700 dark:border-gray-500 border py-1">
        <div class="text-center py-2 border-b dark:border-gray-500">
            <p class="font-bold">Respiratory Cancer Deaths Heat Map (2000-2012)</p>
        </div>
        <div class="mx-auto my-5 w-9/12 flex justify-center">
            <label for="sexFilter">Filter by Gender:</label>
            <select v-model="selectedSex" @change="drawChart" class="ms-3 bg-gray-100 dark:bg-gray-600">
                <option value="All">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>
            <div ref="chart"></div>
        </div>
        <div ref="chart" id="chart"></div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import eventBus from '@/eventBus';
import $ from 'jquery';

export default {
    data() {
        return {
            selectedSex: 'All',
            currentData: null,
            svg: null,
            x: null,
            y: null,
            myColor: null,
            tooltip: null
        };
    },
    mounted() {
        this.initializeChart();
        document.title = 'Heatmap';
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
        if (this.tooltip) {
            this.tooltip.remove();
        }
    },
    methods: {
        initializeChart() {
            // set the dimensions and margins of the graph
            const margin = {top: 30, right: 25, bottom: 30, left: 40},
                width = $(".w-9\\/12").width() - margin.left - margin.right,
                height = 450 - margin.top - margin.bottom;

            // Clear previous chart (if any)
            d3.select(this.$refs.chart).selectAll("*").remove();

            // append the svg object
            this.svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            // Initialize color scale
            this.myColor = d3.scaleSequential(d3.interpolateBlues)
                .domain([1, 100]);

            // Initialize tooltip
            this.tooltip = d3.select("body")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip bg-gray-100 dark:bg-gray-800")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("color", "text-gray-900 dark:text-gray-50")
                .style("position", "absolute");

            this.drawChart();
        },
        drawChart() {
            const margin = {top: 30, right: 25, bottom: 30, left: 40},
                width = $(".w-9\\/12").width() - margin.left - margin.right,
                height = 450 - margin.top - margin.bottom;

            d3.csv("data/WHOMortality_HEAT_MAP.csv").then(data => {
                // Filter data based on selected sex
                const filteredData = data.filter(d =>
                    d.Sex === this.selectedSex
                );
                this.currentData = filteredData;

                // Get unique identifiers
                const myGroups = Array.from(new Set(filteredData.map(d => d["Country Name"])));
                const myVars = Array.from(new Set(filteredData.map(d => d.Year))).sort((a, b) => d3.ascending(a, b));

                // Update scales
                this.x = d3.scaleBand()
                    .range([0, width])
                    .domain(myGroups)
                    .padding(0.05);

                this.y = d3.scaleBand()
                    .range([height, 0])
                    .domain(myVars)
                    .padding(0.05);

                // Update axes with transition
                this.svg.selectAll(".x-axis").remove();
                this.svg.selectAll(".y-axis").remove();

                this.svg.append("g")
                    .attr("class", "x-axis")
                    .style("font-size", 15)
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(this.x).tickSize(0))
                    .select(".domain").remove();

                this.svg.append("g")
                    .attr("class", "y-axis")
                    .style("font-size", 15)
                    .call(d3.axisLeft(this.y).tickSize(0))
                    .select(".domain").remove();

                // Update rectangles with transition
                const rects = this.svg.selectAll("rect")
                    .data(filteredData, d => d["Country Name"] + ':' + d.Year);

                // Exit
                rects.exit()
                    .transition()
                    .duration(750)
                    .style("opacity", 0)
                    .remove();

                // Enter
                const rectEnter = rects.enter()
                    .append("rect")
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("cursor", "pointer")
                    .style("opacity", 0);

                // Update + Enter
                rects.merge(rectEnter)
                    .transition()
                    .duration(750)
                    .attr("x", d => this.x(d["Country Name"]))
                    .attr("y", d => this.y(d.Year))
                    .attr("width", this.x.bandwidth())
                    .attr("height", this.y.bandwidth())
                    .style("fill", d => this.myColor(+d["Death rate per 100 000 population"]))
                    .style("opacity", 0.8);

                // Add event listeners
                this.svg.selectAll("rect")
                    .on("mouseover", this.mouseover)
                    .on("mousemove", this.mousemove)
                    .on("mouseleave", this.mouseleave);
            });
        },
        mouseover(event, d) {
            this.tooltip.style("opacity", 1);
            d3.select(event.currentTarget)
                .style("stroke", "black")
                .style("opacity", 1);
        },
        mousemove(event, d) {
            this.tooltip
                .html(`Country: ${d["Country Name"]}<br>Year: ${d.Year}<br>Death Count: ${d.Number}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        },
        mouseleave(event, d) {
            this.tooltip.style("opacity", 0);
            d3.select(event.currentTarget)
                .style("stroke", "none")
                .style("opacity", 0.8);
        },
        updateChartColor() {
            let theme = localStorage.getItem('theme') || 'light';
            let color = theme === 'dark' ? 'white' : 'black';

            if (this.svg) {
                this.svg.selectAll('text')
                    .transition()
                    .duration(200)
                    .attr('fill', color);

                this.svg.selectAll('.label')
                    .transition()
                    .duration(200)
                    .attr('fill', color);
            }
        }
    }
}
</script>

<style>
.tooltip {
    z-index: 1000;
}
</style>