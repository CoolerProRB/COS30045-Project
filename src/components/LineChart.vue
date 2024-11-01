<template>
    <div class="w-full text-center">
        <h1 class="text-5xl">Riding the Waves: The Rise and Fall of Respiratory Cancer Over Time</h1>
    </div>
    <div class="w-6/12 mx-auto my-3 text-center">
        <p>
            ime marches on, and so does the story of respiratory cancer. Imagine a timeline stretching from 2000 to 2012, where each year brings new chapters of hope and concern.
            Our line chart chronicles the ebb and flow of incidence rates across six countries, revealing trends that speak volumes about public health efforts, societal changes,
            and emerging risks. Watch as lines ascend and descend, reflecting the successes and setbacks in the fight against this formidable foe. This temporal journey not only highlights the progress made but also underscores the ongoing challenges that lie ahead.
        </p>
    </div>
    <div class="mx-auto my-5 w-9/12 dark:bg-gray-800 dark:border-gray-600 border py-3">
        <div class="text-center pb-3 border-b dark:border-gray-500">
            <p class="font-bold">Worldwide Respiratory Cancer Incidence Map (2000-2012)</p>
        </div>
        <div class="mx-auto my-5 w-9/12 flex justify-center">
            <label for="sexFilter">Filter by Gender:</label>
            <select id="sexFilter" @change="filterBySex" class="dark:bg-gray-700 bg-gray-100 ms-3">
                <option value="All">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
        </div>
        <div ref="chart"></div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import eventBus from '@/eventBus';
import $ from 'jquery';

export default {
    mounted() {
        this.drawChart();
        document.title = 'Line Chart';
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
    },
    methods:{
        drawChart(){
            // Set the dimensions and margins of the graph
            var margin = {top: 10, right: 150, bottom: 50, left: 70},
                width = $(".w-9\\/12").width() - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            // Append the SVG object to the chart container
            var svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            // Create a tooltip div that is hidden by default
            var tooltip = d3.select(this.$refs.chart)
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background-color", function () {
                    return localStorage.getItem('theme') !== 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
                })
                .style("color", function () {
                    return localStorage.getItem('theme') === 'dark' ? 'white' : 'black';
                })
                .style("border", "solid 1px #ccc")
                .style("padding", "5px")
                .style("pointer-events", "none");

            // Read the data
            d3.csv("data/WHO_CANCER_CASE_LINE_BAR.csv").then(function(data) {
                // Parse Year and Total as numbers
                data.forEach(function(d) {
                    d.Year = +d.Year;
                    d.Total = +d.Total;
                });

                const selectedSex = document.getElementById('sexFilter').value;
                if (selectedSex !== "All") {
                    data = data.filter(d => d.Sex === selectedSex);
                }

                // Group data by Country and Year, summing up the Total
                var nestedData = d3.rollup(
                    data,
                    v => d3.sum(v, d => d.Total),
                    d => d['Country label'],
                    d => d.Year
                );

                // Prepare data for plotting
                var countries = Array.from(nestedData.keys());
                var dataReady = countries.map(function(country) {
                    var countryData = nestedData.get(country);
                    var years = Array.from(countryData.keys()).sort();
                    var values = years.map(function(year) {
                        return { year: year, value: countryData.get(year), country: country };
                    });
                    return { country: country, values: values };
                });

                // Set up scales
                var allYears = data.map(d => d.Year);
                var x = d3.scaleLinear()
                    .domain(d3.extent(allYears))
                    .range([0, width]);

                var maxTotal = d3.max(dataReady, function(c) {
                    return d3.max(c.values, function(d) { return d.value; });
                });

                var y = d3.scaleLinear()
                    .domain([0, maxTotal])
                    .range([height, 0]);

                // Add X axis
                svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

                // Add Y axis
                svg.append("g")
                    .call(d3.axisLeft(y));

                // Add X axis label
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("x", width / 2)
                    .attr("y", height + margin.bottom - 10)
                    .text("Total Respiratory Cancer for each country per 100000 person (2000-2012)")
                    .style("font-size", "14px")
                    .attr("fill", function() {
                        return localStorage.getItem('theme') === 'dark' ? 'white' : 'black';
                    });

                // Optional: Add Y axis label
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("transform", "rotate(-90)")
                    .attr("x", -height / 2)
                    .attr("y", -margin.left + 20)
                    .text("Number of Cases per 100,000 People")
                    .style("font-size", "14px").attr("fill", function() {
                        return localStorage.getItem('theme') === 'dark' ? 'white' : 'black';
                    });

                // Define color scale
                var color = d3.scaleOrdinal()
                    .domain(countries)
                    .range(d3.schemeCategory10);

                // Draw the lines
                var line = d3.line()
                    .x(function(d) { return x(d.year); })
                    .y(function(d) { return y(d.value); });

                svg.selectAll(".line")
                    .data(dataReady)
                    .enter()
                    .append("path")
                    .attr("class", "line")
                    .attr("fill", "none")
                    .attr("stroke", function(d){ return color(d.country); })
                    .attr("stroke-width", 1.5)
                    .attr("d", function(d){
                        return line(d.values);
                    });

                // Add the points
                svg.selectAll("myDots")
                    .data(dataReady)
                    .enter()
                    .append('g')
                    .style("fill", function(d){ return color(d.country); })
                    .selectAll("myPoints")
                    .data(function(d){ return d.values })
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) { return x(d.year); })
                    .attr("cy", function(d) { return y(d.value); })
                    .attr("r", 5)
                    .attr("stroke", "white")
                    .on("mouseover", function(event, d) {
                        tooltip
                            .style("opacity", 1)
                            .html("<strong>Country:</strong> " + d.country + "<br/>" +
                                "<strong>Year:</strong> " + d.year + "<br/>" +
                                "<strong>Total:</strong> " + d.value)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mousemove", function(event, d) {
                        tooltip
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(event, d) {
                        tooltip
                            .style("opacity", 0);
                    });

                // Optional: Add legend
                svg.selectAll(".legend")
                    .data(countries)
                    .enter()
                    .append("text")
                    .attr("x", width + 40)
                    .attr("y", function(d, i) { return 15 + i * 20; })
                    .text(function(d) { return d; })
                    .style("fill", function(d) { return color(d); })
                    .style("font-size", "12px")
                    .attr("alignment-baseline","middle");

                svg.selectAll(".legend-rect")
                    .data(countries)
                    .enter()
                    .append("rect")
                    .attr("x", width + 20)
                    .attr("y", function(d, i) { return i * 20 + 8; })
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", function(d) { return color(d); });
            });
        },
        filterBySex() {
            const selectedSex = document.getElementById('sexFilter').value;

            // Read the data again and filter by the selected gender
            d3.csv("data/WHO_CANCER_CASE_LINE_BAR.csv").then((data) => {
                data.forEach(function(d) {
                    d.Year = +d.Year;
                    d.Total = +d.Total;
                });

                if (selectedSex !== "All") {
                    data = data.filter(d => d.Sex === selectedSex);
                }

                // Group data by Country and Year, summing up the Total
                var nestedData = d3.rollup(
                    data,
                    v => d3.sum(v, d => d.Total),
                    d => d['Country label'],
                    d => d.Year
                );

                // Prepare data for plotting
                var countries = Array.from(nestedData.keys());
                var dataReady = countries.map(function(country) {
                    var countryData = nestedData.get(country);
                    var years = Array.from(countryData.keys()).sort();
                    var values = years.map(function(year) {
                        return { year: year, value: countryData.get(year), country: country };
                    });
                    return { country: country, values: values };
                });

                // Update scales if needed
                var allYears = data.map(d => d.Year);
                var x = d3.scaleLinear()
                    .domain(d3.extent(allYears))
                    .range([0, $(".w-9\\/12").width() - 220]);

                var maxTotal = d3.max(dataReady, function(c) {
                    return d3.max(c.values, function(d) { return d.value; });
                });

                var y = d3.scaleLinear()
                    .domain([0, maxTotal])
                    .range([400 - 60, 0]);

                // Select the SVG group for lines and dots
                var svg = d3.select(this.$refs.chart).select('svg').select('g');

                // Define the line generator
                var line = d3.line()
                    .x(function(d) { return x(d.year); })
                    .y(function(d) { return y(d.value); });

                // Update lines with transition
                svg.selectAll(".line")
                    .data(dataReady)
                    .join(
                        enter => enter.append("path")
                            .attr("class", "line")
                            .attr("fill", "none")
                            .attr("stroke", function(d){ return d3.scaleOrdinal().domain(countries).range(d3.schemeCategory10)(d.country); })
                            .attr("stroke-width", 1.5)
                            .attr("d", d => line(d.values))
                            .style("opacity", 0)
                            .transition()
                            .duration(1000)
                            .style("opacity", 1),
                        update => update
                            .transition()
                            .duration(1000)
                            .attr("d", d => line(d.values))
                    );

                // Update the points with transition
                const dots = svg.selectAll("circle")
                    .data(dataReady.flatMap(d => d.values));

                dots.join(
                    enter => enter.append("circle")
                        .attr("r", 5)
                        .attr("fill", d => d3.scaleOrdinal().domain(countries).range(d3.schemeCategory10)(d.country))
                        .attr("cx", d => x(d.year))
                        .attr("cy", d => y(d.value))
                        .style("opacity", 0)
                        .transition()
                        .duration(1000)
                        .style("opacity", 1),
                    update => update
                        .transition()
                        .duration(1000)
                        .attr("cx", d => x(d.year))
                        .attr("cy", d => y(d.value))
                );
            });
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