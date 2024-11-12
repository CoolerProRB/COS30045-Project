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
            // Get the width of the container element and calculate chart dimensions
            const containerWidth = $(".w-9\\/12").width();
            this.width = containerWidth - this.margin.left - this.margin.right; // Set chart width based on container width
            this.height = 600 - this.margin.top - this.margin.bottom; // Set chart height with fixed value minus margins

            // Create SVG container for the chart
            this.svg = d3.select(this.$refs.chart) // Select the container where the chart will be placed
                .append("svg") // Append an SVG element
                .attr("width", this.width + this.margin.left + this.margin.right) // Set SVG total width including margins
                .attr("height", this.height + this.margin.top + this.margin.bottom) // Set SVG total height including margins
                .append("g") // Append a group element to apply margins and padding
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`); // Translate group element to respect margins

            // Initialize scales for the x and y axes
            this.xScale = d3.scaleLinear().range([0, this.width]); // X scale for values, range from 0 to chart width
            this.yScale = d3.scaleBand().range([0, this.height]).padding(this.barPadding); // Y scale for countries, range from top to bottom

            // Initialize axes groups
            this.xAxisGroup = this.svg.append("g") // Append group element for x-axis
                .attr("transform", `translate(0, ${this.height})`) // Position x-axis at the bottom of the chart
                .attr("class", "x-axis");

            this.yAxisGroup = this.svg.append("g") // Append group element for y-axis
                .attr("class", "y-axis");

            // Initialize color scale to differentiate countries using an ordinal color scheme
            this.colorScale = d3.scaleOrdinal(d3.schemeTableau10); // Use Tableau color scheme

            // Initialize tooltip for showing data on mouse interaction
            this.tooltip = d3.select("body") // Append tooltip div to the body
                .append("div")
                .attr("class", "tooltip bg-gray-100 dark:bg-gray-800 p-2 rounded shadow-lg") // Set classes for styling tooltip
                .style("opacity", 0) // Initially hide tooltip
                .style("position", "absolute"); // Set position as absolute for following mouse pointer

            // Draw the initial chart
            this.drawChart();
        },

        drawChart() {
            // Clear previous animation interval if it exists
            if (this.interval) {
                clearInterval(this.interval);
            }

            // Filter data based on the selected gender (sex)
            let filteredData = this.data.filter(d => d.Sex === this.selectedSex);

            // Get a list of unique years from the filtered data and sort them
            this.years = Array.from(new Set(filteredData.map(d => d.Year))).sort((a, b) => a - b);

            // Prepare data for each year
            this.dataByYear = {};
            this.years.forEach(year => {
                let yearData = filteredData.filter(d => d.Year === year);
                // Sort data by death count in descending order
                yearData.sort((a, b) => b.Number - a.Number);
                // Take the top 10 countries for each year
                this.dataByYear[year] = yearData.slice(0, 10);
            });

            // Initialize animation with the first year
            this.yearIndex = 0;
            this.currentYear = this.years[this.yearIndex];

            // Update the chart with the data for the current year
            this.updateChart(this.dataByYear[this.currentYear]);

            // Start an interval to animate year transitions
            this.interval = setInterval(() => {
                this.yearIndex++;
                if (this.yearIndex >= this.years.length) {
                    clearInterval(this.interval); // Stop animation if all years have been shown
                    return;
                }
                this.currentYear = this.years[this.yearIndex];
                this.updateChart(this.dataByYear[this.currentYear]); // Update chart for the new year
            }, this.duration); // Duration between each transition
        },

        updateChart(yearData) {
            // Create a D3 transition for smooth animations
            const t = d3.transition().duration(this.duration).ease(d3.easeLinear);

            // Update scales to match the new data
            this.xScale.domain([0, d3.max(yearData, d => d.Number) * 1.3]); // Set domain with a margin for readability
            this.yScale.domain(yearData.map(d => d["Country Name"]).reverse()); // Set domain for y-axis with country names

            // Update x and y axes with the new scales
            this.xAxisGroup.transition(t).call(d3.axisBottom(this.xScale).ticks(10)); // Update x-axis
            this.yAxisGroup.transition(t).call(d3.axisLeft(this.yScale)); // Update y-axis

            // JOIN new data with old elements (bars)
            const bars = this.svg.selectAll(".bar")
                .data(yearData, d => d["Country Name"]); // Use country name as the key for data binding

            // EXIT old elements not present in new data (remove old bars)
            bars.exit()
                .transition(t) // Apply exit transition
                .attr("width", 0) // Shrink width to 0
                .remove(); // Remove the element

            // UPDATE old elements still present in the new data (update existing bars)
            bars.transition(t)
                .attr("y", d => this.yScale(d["Country Name"])) // Set y position based on country name
                .attr("width", d => this.xScale(d.Number)) // Set width based on death count
                .attr("height", this.yScale.bandwidth()); // Set height based on y scale bandwidth

            // ENTER new elements present in new data (add new bars)
            bars.enter()
                .append("rect")
                .attr("class", "bar") // Set class for styling
                .attr("y", d => this.yScale(d["Country Name"])) // Set y position based on country name
                .attr("height", this.yScale.bandwidth()) // Set height of the bar
                .attr("x", 1) // Set x position to avoid overlapping with the y-axis
                .attr("width", 0) // Initially set width to 0 for animation
                .style("fill", d => this.colorScale(d["Country Name"])) // Set bar color based on country
                .on("mouseover", this.mouseover) // Add mouseover event handler
                .on("mousemove", this.mousemove) // Add mousemove event handler
                .on("mouseleave", this.mouseleave) // Add mouseleave event handler
                .transition(t) // Apply enter transition
                .attr("width", d => this.xScale(d.Number)); // Animate width based on death count

            // Update labels for each bar to display death counts
            const labels = this.svg.selectAll(".label")
                .data(yearData, d => d["Country Name"]); // Use country name as key for labels

            // EXIT old labels not present in new data
            labels.exit()
                .transition(t)
                .attr("x", 0) // Move labels to x = 0
                .remove(); // Remove labels

            // UPDATE old labels still present in new data
            labels.transition(t)
                .attr("y", d => this.yScale(d["Country Name"]) + this.yScale.bandwidth() / 2 + 5) // Set y position to center the label on the bar
                .attr("x", d => this.xScale(d.Number) + 5) // Set x position slightly beyond the bar width
                .text(d => d.Number); // Update text with the current value

            // ENTER new labels for new data
            labels.enter()
                .append("text")
                .attr("class", "label") // Set class for styling
                .attr("y", d => this.yScale(d["Country Name"]) + this.yScale.bandwidth() / 2 + 5) // Set y position to center the label
                .attr("x", d => this.xScale(d.Number) + 5) // Set x position slightly beyond the bar width
                .text(d => d.Number) // Set the text value
                .attr('fill', localStorage.getItem("theme") === 'dark' ? 'white' : 'black'); // Set fill color based on theme

            // Update the year label displayed in the chart
            this.svg.selectAll(".yearLabel").remove(); // Remove any existing year label
            this.svg.append("text")
                .attr("class", "yearLabel") // Set class for styling
                .attr("x", this.width - 50) // Set x position near the right side of the chart
                .attr("y", this.height - 10) // Set y position slightly above the x-axis
                .attr("text-anchor", "end") // Align text to the end
                .style("font-size", "40px") // Set font size
                .style("opacity", 0.5) // Set opacity for visual emphasis
                .text(this.currentYear) // Set text to the current year
                .attr('fill', localStorage.getItem("theme") === 'dark' ? 'white' : 'black'); // Set fill color based on theme
        },
        // Event handler for mouseover (bar hover)
        mouseover(event, d) {
            this.tooltip.style("opacity", 1); // Make tooltip visible
            d3.select(event.currentTarget)
                .style("stroke", "black") // Add black stroke to highlight bar
                .style("opacity", 0.8); // Reduce opacity for visual effect
        },
        // Event handler for mousemove (tooltip follow mouse)
        mousemove(event, d) {
            this.tooltip
                .html(`Country: ${d["Country Name"]}<br>Year: ${d.Year}<br>Death Count: ${d.Number}`) // Set tooltip content
                .style("left", (event.pageX + 10) + "px") // Position tooltip near mouse cursor
                .style("top", (event.pageY - 20) + "px");
        },
        // Event handler for mouseleave (bar hover out)
        mouseleave(event, d) {
            this.tooltip.style("opacity", 0); // Hide tooltip
            d3.select(event.currentTarget)
                .style("stroke", "none") // Remove bar stroke
                .style("opacity", 1); // Restore opacity
        },
        // Restart animation from the first year
        restartAnimation() {
            if (this.interval) {
                clearInterval(this.interval); // Clear existing interval to prevent overlap
            }
            this.yearIndex = 0; // Reset year index to the first year
            this.currentYear = this.years[this.yearIndex]; // Set current year to the first year
            this.updateChart(this.dataByYear[this.currentYear]); // Update chart to the first year

            // Start animation interval again
            this.interval = setInterval(() => {
                this.yearIndex++;
                if (this.yearIndex >= this.years.length) {
                    clearInterval(this.interval); // Stop animation if all years have been shown
                    return;
                }
                this.currentYear = this.years[this.yearIndex]; // Update current year
                this.updateChart(this.dataByYear[this.currentYear]); // Update chart for the current year
            }, this.duration + 1000); // Duration between transitions (including additional delay)
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
