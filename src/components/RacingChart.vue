<template>
    <div class="w-full text-center">
        <h1 class="text-5xl">Lives Lost: A Racing Bar Chart of Respiratory Cancer Mortality</h1>
    </div>
    <div class="w-6/12 mx-auto my-3 text-center">
        <p>
            Behind every statistic lies a human story. Our racing bar chart brings these stories to the forefront, illustrating the stark reality of lives lost to respiratory cancer over time.
            Watch as the bars race across the chart, reflecting the shifting mortality rates in different countries from 2000 to 2012. This dynamic visualization highlights the urgency for
            advancements in healthcare and the impact of interventions over the years.
        </p>
    </div>
    <div class="mx-auto my-5 w-9/12 dark:bg-gray-700 dark:border-gray-500 border py-1">
        <div class="text-center py-2 border-b dark:border-gray-500">
            <p class="font-bold">Respiratory Cancer Deaths Racing Bar Chart (2000-2012)</p>
        </div>
        <div class="mx-auto my-5 w-9/12 flex justify-center items-center space-x-4">
            <label for="sexFilter">Filter by Gender:</label>
            <select v-model="selectedSex" @change="drawChart" class="ms-3 bg-gray-100 dark:bg-gray-600">
                <option value="All">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>
            <!-- Restart Button -->
            <button @click="restartAnimation" class="ms-3 bg-gray-100 dark:bg-gray-600 px-2 cursor-pointer">
                Restart Animation
            </button>
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
            data: [],
            svg: null,
            width: 0,
            height: 0,
            margin: { top: 50, right: 30, bottom: 50, left: 100 },
            barPadding: 0.1,
            duration: 1500,
            currentYear: null,
            interval: null,
            years: [],
            xScale: null,
            yScale: null,
            xAxisGroup: null,
            yAxisGroup: null,
            colorScale: null,
            tooltip: null,
            dataByYear: {},
            yearIndex: 0
        };
    },
    mounted() {
        document.title = 'Racing Bar Chart';
        d3.csv("data/WHOMortality_HEAT_MAP.csv").then(data => {
            // Convert data types
            data.forEach(d => {
                d.Year = +d.Year;
                d.Number = +d.Number;
            });
            this.data = data;
            this.initializeChart();
            eventBus.on('themeChanged', this.updateChartColor);
        });
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.tooltip) {
            this.tooltip.remove();
        }
    },
    methods: {
        initializeChart() {
            const containerWidth = $(".w-9\\/12").width();
            this.width = containerWidth - this.margin.left - this.margin.right;
            this.height = 600 - this.margin.top - this.margin.bottom;

            // Create SVG
            this.svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
                .append("g")
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

            // Initialize scales
            this.xScale = d3.scaleLinear().range([0, this.width]);
            this.yScale = d3.scaleBand().range([0, this.height]).padding(this.barPadding);

            // Initialize axes groups
            this.xAxisGroup = this.svg.append("g")
                .attr("transform", `translate(0, ${this.height})`)
                .attr("class", "x-axis");

            this.yAxisGroup = this.svg.append("g")
                .attr("class", "y-axis");

            // Initialize color scale
            this.colorScale = d3.scaleOrdinal(d3.schemeTableau10);

            // Initialize tooltip
            this.tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip bg-gray-100 dark:bg-gray-800 p-2 rounded shadow-lg")
                .style("opacity", 0)
                .style("position", "absolute");

            this.drawChart();
        },
        drawChart() {
            if (this.interval) {
                clearInterval(this.interval);
            }

            // Filter data based on selected sex
            let filteredData = this.data.filter(d => d.Sex === this.selectedSex);

            // Get list of years and sort them
            this.years = Array.from(new Set(filteredData.map(d => d.Year))).sort((a, b) => a - b);

            // Prepare data for each year
            this.dataByYear = {};
            this.years.forEach(year => {
                let yearData = filteredData.filter(d => d.Year === year);
                // Sort by death count descending
                yearData.sort((a, b) => b.Number - a.Number);
                // Take top 10 countries
                this.dataByYear[year] = yearData.slice(0, 10);
            });

            // Start animation
            this.yearIndex = 0;
            this.currentYear = this.years[this.yearIndex];

            this.updateChart(this.dataByYear[this.currentYear]);

            this.interval = setInterval(() => {
                this.yearIndex++;
                if (this.yearIndex >= this.years.length) {
                    clearInterval(this.interval);
                    return;
                }
                this.currentYear = this.years[this.yearIndex];
                this.updateChart(this.dataByYear[this.currentYear]);
            }, this.duration);
        },
        updateChart(yearData) {
            const t = d3.transition().duration(this.duration).ease(d3.easeLinear);

            // Update scales
            this.xScale.domain([0, d3.max(yearData, d => d.Number) * 1.3]);
            this.yScale.domain(yearData.map(d => d["Country Name"]).reverse());

            // Update axes
            this.xAxisGroup.transition(t).call(d3.axisBottom(this.xScale).ticks(10));
            this.yAxisGroup.transition(t).call(d3.axisLeft(this.yScale));

            // JOIN new data with old elements.
            const bars = this.svg.selectAll(".bar")
                .data(yearData, d => d["Country Name"]);

            // EXIT old elements not present in new data.
            bars.exit()
                .transition(t)
                .attr("width", 0)
                .remove();

            // UPDATE old elements present in new data.
            bars.transition(t)
                .attr("y", d => this.yScale(d["Country Name"]))
                .attr("width", d => this.xScale(d.Number))
                .attr("height", this.yScale.bandwidth());

            // ENTER new elements present in new data.
            bars.enter()
                .append("rect")
                .attr("class", "bar")
                .attr("y", d => this.yScale(d["Country Name"]))
                .attr("height", this.yScale.bandwidth())
                .attr("x", 1)
                .attr("width", 0)
                .style("fill", d => this.colorScale(d["Country Name"]))
                .on("mouseover", this.mouseover)
                .on("mousemove", this.mousemove)
                .on("mouseleave", this.mouseleave)
                .transition(t)
                .attr("width", d => this.xScale(d.Number));

            // Update labels
            const labels = this.svg.selectAll(".label")
                .data(yearData, d => d["Country Name"]);

            labels.exit()
                .transition(t)
                .attr("x", 0)
                .remove();

            labels.transition(t)
                .attr("y", d => this.yScale(d["Country Name"]) + this.yScale.bandwidth() / 2 + 5)
                .attr("x", d => this.xScale(d.Number) + 5)
                .text(d => d.Number);

            labels.enter()
                .append("text")
                .attr("class", "label")
                .attr("y", d => this.yScale(d["Country Name"]) + this.yScale.bandwidth() / 2 + 5)
                .attr("x", d => this.xScale(d.Number) + 5)
                .text(d => d.Number)
                .attr('fill', localStorage.getItem("theme") === 'dark' ? 'white' : 'black');

            // Update title with current year
            this.svg.selectAll(".yearLabel").remove();
            this.svg.append("text")
                .attr("class", "yearLabel")
                .attr("x", this.width - 50)
                .attr("y", this.height - 10)
                .attr("text-anchor", "end")
                .style("font-size", "40px")
                .style("opacity", 0.5)
                .text(this.currentYear)
                .attr('fill', localStorage.getItem("theme") === 'dark' ? 'white' : 'black');
        },
        mouseover(event, d) {
            this.tooltip.style("opacity", 1);
            d3.select(event.currentTarget)
                .style("stroke", "black")
                .style("opacity", 0.8);
        },
        mousemove(event, d) {
            this.tooltip
                .html(`Country: ${d["Country Name"]}<br>Year: ${d.Year}<br>Death Count: ${d.Number}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        },
        mouseleave(event, d) {
            this.tooltip.style("opacity", 0);
            d3.select(event.currentTarget)
                .style("stroke", "none")
                .style("opacity", 1);
        },
        restartAnimation() {
            if (this.interval) {
                clearInterval(this.interval);
            }
            this.yearIndex = 0;
            this.currentYear = this.years[this.yearIndex];
            this.updateChart(this.dataByYear[this.currentYear]);

            this.interval = setInterval(() => {
                this.yearIndex++;
                if (this.yearIndex >= this.years.length) {
                    clearInterval(this.interval);
                    return;
                }
                this.currentYear = this.years[this.yearIndex];
                this.updateChart(this.dataByYear[this.currentYear]);
            }, this.duration + 1000);
        },
        updateChartColor() {
            let theme = localStorage.getItem('theme') || 'light';
            let textColor = theme === 'dark' ? 'white' : 'black';

            if (this.svg) {
                this.svg.selectAll('.x-axis path, .x-axis line, .y-axis path, .y-axis line')
                    .attr('stroke', textColor);

                this.svg.selectAll('.x-axis text, .y-axis text, .label')
                    .attr('fill', textColor);

                this.svg.selectAll('.yearLabel')
                    .attr('fill', textColor);
            }

            if (this.tooltip) {
                this.tooltip
                    .style('background-color', theme === 'dark' ? '#2d3748' : '#f7fafc')
                    .style('color', textColor);
            }
        }
    }
}
</script>

<style>
.tooltip {
    position: absolute;
    text-align: left;
    padding: 8px;
    font-size: 12px;
    background: #f7fafc;
    border: 1px solid #ccc;
    border-radius: 4px;
    pointer-events: none;
    z-index: 1000;
}
</style>
