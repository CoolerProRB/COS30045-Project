<template>
    <div class="w-full text-center">
        <h1 class="text-5xl">Lives Lost: A Scatterplot of Respiratory Cancer Mortality</h1>
    </div>
    <div class="w-6/12 mx-auto my-3 text-center">
        <p>
            Behind every statistic lies a human story. Our scatterplot brings these stories to the forefront, illustrating the stark reality of lives lost to respiratory cancer each year.
            As you observe the data points, notice the trends in mortality rates across different countries and years. Each dot represents a moment in time, urging us to reflect on the
            effectiveness of healthcare systems and the urgent need for continued advancements in treatment and prevention.
        </p>
    </div>
    <div class="mx-auto my-5 w-9/12 dark:bg-gray-700 dark:border-gray-500 border py-1">
        <div class="text-center py-2 border-b dark:border-gray-500">
            <p class="font-bold">Respiratory Cancer Deaths Scatterplot (2000-2012)</p>
        </div>
        <div class="mx-auto my-5 w-9/12 flex justify-center items-center space-x-4">
            <label for="sexFilter">Filter by Gender:</label>
            <select v-model="selectedSex" @change="drawChart" class="ms-3 bg-gray-100 dark:bg-gray-600">
                <option value="All">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>
        </div>
        <!-- Legend placed here -->
        <div ref="legend" class="mx-auto my-2 w-9/12 flex flex-wrap justify-center items-center"></div>
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
            tooltip: null,
            countries: [],
            data: [],
            colorScale: null
        };
    },
    mounted() {
        document.title = 'Scatterplot';
        d3.csv("data/WHOMortality_HEAT_MAP.csv").then(data => {
            this.data = data;
            // Get list of countries
            this.countries = Array.from(new Set(data.map(d => d["Country Name"]))).sort();
            this.initializeChart();
            eventBus.on('themeChanged', this.updateChartColor);
        });
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
        if (this.tooltip) {
            this.tooltip.remove();
        }
    },
    methods: {
        initializeChart() {
            // Set dimensions and margins
            const margin = { top: 30, right: 25, bottom: 50, left: 60 },
                width = $(".w-9\\/12").width() - margin.left - margin.right,
                height = 450 - margin.top - margin.bottom;

            // Append SVG object
            this.svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            // Initialize tooltip
            this.tooltip = d3.select("body")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip bg-gray-100 dark:bg-gray-800")
                .style("border", "solid 1px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("position", "absolute");

            this.drawChart();
        },
        drawChart() {
            const margin = { top: 30, right: 25, bottom: 50, left: 50 },
                width = $(".w-9\\/12").width() - margin.left - margin.right,
                height = 450 - margin.top - margin.bottom;

            // Clear previous elements
            this.svg.selectAll("*").remove();
            d3.select(this.$refs.legend).selectAll("*").remove();

            let data = this.data;

            // Convert strings to numbers
            data.forEach(d => {
                d.Year = +d.Year;
                d.Number = +d.Number;
            });

            // Filter data based on selected sex
            let filteredData = data.filter(d => d.Sex === this.selectedSex);

            this.currentData = filteredData;

            // Set up scales
            this.x = d3.scaleLinear()
                .domain(d3.extent(filteredData, d => d.Year))
                .range([0, width]);

            this.y = d3.scaleLinear()
                .domain([0, d3.max(filteredData, d => d.Number)])
                .range([height, 0]);

            // Color scale for countries
            this.colorScale = d3.scaleOrdinal()
                .domain(this.countries)
                .range(d3.schemeCategory10.concat(d3.schemeSet3, d3.schemePaired));

            // Add gridlines
            const xAxisGrid = d3.axisBottom(this.x)
                .tickSize(-height)
                .tickFormat('')
                .ticks(10);

            const yAxisGrid = d3.axisLeft(this.y)
                .tickSize(-width)
                .tickFormat('')
                .ticks(10);

            // Add X gridlines
            const xGrid = this.svg.append('g')
                .attr('class', 'grid')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxisGrid);

            xGrid.selectAll("line")
                .attr("stroke", localStorage.getItem("theme") === 'dark' ? '#888' : '#ccc')
                .attr("stroke-dasharray", "2,2");

            xGrid.select(".domain").remove(); // Remove the axis line

            // Add Y gridlines
            const yGrid = this.svg.append('g')
                .attr('class', 'grid')
                .call(yAxisGrid);

            yGrid.selectAll("line")
                .attr("stroke", localStorage.getItem("theme") === 'dark' ? '#888' : '#ccc')
                .attr("stroke-dasharray", "2,2");

            yGrid.select(".domain").remove(); // Remove the axis line

            // Add X axis
            this.svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(this.x).tickFormat(d3.format("d")))
                .selectAll("text")
                .attr("transform", "translate(0,10)");

            // Add Y axis
            this.svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(this.y));

            // Add axis labels
            this.svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", width / 2)
                .attr("y", height + 40)
                .text("Year")
                .attr('fill', localStorage.getItem("theme") === 'dark' ? 'white' : 'black');

            this.svg.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("x", -height / 2)
                .text("Death Count")
                .attr('fill', localStorage.getItem("theme") === 'dark' ? 'white' : 'black');

            // Add dots
            this.svg.append('g')
                .selectAll("dot")
                .data(filteredData)
                .enter()
                .append("circle")
                .attr("cx", d => this.x(d.Year))
                .attr("cy", d => this.y(d.Number))
                .attr("r", 4)
                .style("fill", d => this.colorScale(d["Country Name"]))
                .on("mouseover", this.mouseover)
                .on("mousemove", this.mousemove)
                .on("mouseleave", this.mouseleave);

            // Create legend in the legend div
            const legendContainer = d3.select(this.$refs.legend);

            const legendItems = legendContainer.selectAll(".legend-item")
                .data(this.countries)
                .enter()
                .append("div")
                .attr("class", "legend-item flex items-center space-x-2 my-1");

            legendItems.append("div")
                .style("width", "12px")
                .style("height", "12px")
                .style("background-color", d => this.colorScale(d));

            legendItems.append("span")
                .style("font-size", "12px")
                .text(d => d);
        },
        mouseover(event, d) {
            this.tooltip.style("opacity", 1);
            d3.select(event.currentTarget)
                .style("stroke", "black")
                .attr("r", 6);
        },
        mousemove(event, d) {
            this.tooltip
                .html(`Country: ${d["Country Name"]}<br>Year: ${d.Year}<br>Death Count (${d.Sex}): ${d.Number}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        },
        mouseleave(event, d) {
            this.tooltip.style("opacity", 0);
            d3.select(event.currentTarget)
                .style("stroke", "none")
                .attr("r", 4);
        },
        updateChartColor() {
            let theme = localStorage.getItem('theme') || 'light';
            let color = theme === 'dark' ? 'white' : 'black';
            let gridColor = theme === 'dark' ? '#888' : '#ccc';

            if (this.svg) {
                this.svg.selectAll('text')
                    .transition()
                    .duration(200)
                    .attr('fill', color);

                this.svg.selectAll('.grid line')
                    .transition()
                    .duration(200)
                    .attr('stroke', gridColor);
            }
        }
    }
}
</script>

<style>
.tooltip {
    z-index: 1000;
}
.legend-item {
    margin: 5px;
}
</style>
