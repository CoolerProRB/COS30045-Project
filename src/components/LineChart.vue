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
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
    },
    methods:{
        drawChart() {
            // Set the dimensions and margins of the graph
            var margin = { top: 10, right: 150, bottom: 50, left: 70 },
                width = $(".w-9\\/12").width() - margin.left - margin.right, // Calculate the width based on container width minus margins
                height = 400 - margin.top - margin.bottom; // Set the height with margins

            // Append the SVG object to the chart container
            var svg = d3.select(this.$refs.chart) // Select the container where the chart will be placed
                .append("svg") // Append an SVG element
                .attr("width", width + margin.left + margin.right) // Set the total width of the SVG (includes margins)
                .attr("height", height + margin.top + margin.bottom) // Set the total height of the SVG (includes margins)
                .append("g") // Append a group element to apply margins and padding
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // Translate the group element to respect margins

            // Create a tooltip div that is hidden by default
            var tooltip = d3.select(this.$refs.chart) // Select the container where the chart is rendered
                .append("div") // Append a div for the tooltip
                .style("opacity", 0) // Set the tooltip's initial opacity to 0 (invisible)
                .attr("class", "tooltip") // Assign the class 'tooltip' to the div
                .style("position", "absolute") // Set the position of the tooltip to absolute
                .style("background-color", function () { // Conditionally set the background color based on the theme
                    return localStorage.getItem('theme') !== 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
                })
                .style("color", function () { // Conditionally set the text color based on the theme
                    return localStorage.getItem('theme') === 'dark' ? 'white' : 'black';
                })
                .style("border", "solid 1px #ccc") // Add a border to the tooltip
                .style("padding", "5px") // Add padding inside the tooltip
                .style("pointer-events", "none"); // Disable pointer events to avoid conflicts during mouse movements

            // Read the CSV data for plotting
            d3.csv("data/WHO_CANCER_CASE_LINE_BAR.csv").then(function (data) {
                // Parse Year and Total columns as numbers for correct plotting
                data.forEach(function (d) {
                    d.Year = +d.Year; // Convert 'Year' to a number
                    d.Total = +d.Total; // Convert 'Total' to a number
                });

                // Get the selected filter value for Sex
                const selectedSex = document.getElementById('sexFilter').value;
                if (selectedSex !== "All") {
                    data = data.filter(d => d.Sex === selectedSex); // Filter the data based on the selected gender
                }

                // Group data by Country and Year, summing up the 'Total' value
                var nestedData = d3.rollup(
                    data,
                    v => d3.sum(v, d => d.Total), // Summing the 'Total' values for each group
                    d => d['Country label'], // Group by country
                    d => d.Year // Then group by year
                );

                // Prepare data for plotting by converting grouped data to an array
                var countries = Array.from(nestedData.keys()); // Get the list of countries
                var dataReady = countries.map(function (country) {
                    var countryData = nestedData.get(country); // Get data for each country
                    var years = Array.from(countryData.keys()).sort(); // Get and sort the years
                    var values = years.map(function (year) {
                        return { year: year, value: countryData.get(year), country: country }; // Prepare each entry with year, value, and country
                    });
                    return { country: country, values: values }; // Return data formatted for each country
                });

                // Set up scales for the X and Y axes
                var allYears = data.map(d => d.Year); // Extract all the years from the dataset
                var x = d3.scaleLinear()
                    .domain(d3.extent(allYears)) // Set the X-axis domain from min to max year
                    .range([0, width]); // Set the range from 0 to the chart width

                var maxTotal = d3.max(dataReady, function (c) {
                    return d3.max(c.values, function (d) { return d.value; }); // Get the maximum total value for Y-axis
                });

                var y = d3.scaleLinear()
                    .domain([0, maxTotal]) // Set the Y-axis domain from 0 to max total value
                    .range([height, 0]); // Set the range from height (bottom) to 0 (top)

                // Add X axis to the SVG
                svg.append("g")
                    .attr("transform", `translate(0, ${height})`) // Position the X-axis at the bottom of the chart
                    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Draw the X-axis with tick labels formatted as integers

                // Add Y axis to the SVG
                svg.append("g")
                    .call(d3.axisLeft(y)); // Draw the Y-axis on the left side of the chart

                // Add X axis label to the chart
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("x", width / 2) // Position the label in the center of the X-axis
                    .attr("y", height + margin.bottom - 10) // Position the label below the X-axis
                    .text("Total Respiratory Cancer for each country per 100000 person (2000-2012)") // Label text
                    .style("font-size", "14px") // Set font size for the label
                    .attr("fill", function () {
                        return localStorage.getItem('theme') === 'dark' ? 'white' : 'black'; // Set label color based on theme
                    });

                // Optional: Add Y axis label to the chart
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("transform", "rotate(-90)") // Rotate the label to align with the Y-axis
                    .attr("x", -height / 2) // Position the label in the middle of the Y-axis
                    .attr("y", -margin.left + 20) // Position the label to the left of the Y-axis
                    .text("Number of Cases per 100,000 People") // Label text
                    .style("font-size", "14px")
                    .attr("fill", function () {
                        return localStorage.getItem('theme') === 'dark' ? 'white' : 'black'; // Set label color based on theme
                    });

                // Define color scale to distinguish between different countries
                var color = d3.scaleOrdinal()
                    .domain(countries) // Set the domain to the list of countries
                    .range(d3.schemeCategory10); // Use D3's category10 color scheme for distinct colors

                // Draw the lines for each country
                var line = d3.line()
                    .x(function (d) { return x(d.year); }) // Set X value based on the year
                    .y(function (d) { return y(d.value); }); // Set Y value based on the total number of cases

                svg.selectAll(".line")
                    .data(dataReady) // Bind data to the lines
                    .enter()
                    .append("path") // Append path elements for each line
                    .attr("class", "line")
                    .attr("fill", "none")
                    .attr("stroke", function (d) { return color(d.country); }) // Set the line color based on the country
                    .attr("stroke-width", 1.5) // Set the line width
                    .attr("d", function (d) {
                        return line(d.values); // Draw the line based on the data values
                    });

                // Add the points representing each data value
                svg.selectAll("myDots")
                    .data(dataReady) // Bind data to groups for each country's points
                    .enter()
                    .append('g')
                    .style("fill", function (d) { return color(d.country); }) // Set the point color based on the country
                    .selectAll("myPoints")
                    .data(function (d) { return d.values }) // Extract values for each country
                    .enter()
                    .append("circle") // Append circles for each point
                    .attr("cx", function (d) { return x(d.year); }) // Set X position based on year
                    .attr("cy", function (d) { return y(d.value); }) // Set Y position based on value
                    .attr("r", 5) // Set radius for the circle
                    .attr("stroke", "white") // Add a white border around each circle
                    .on("mouseover", function (event, d) { // Tooltip on mouseover
                        tooltip
                            .style("opacity", 1) // Make the tooltip visible
                            .html("<strong>Country:</strong> " + d.country + "<br/>" +
                                "<strong>Year:</strong> " + d.year + "<br/>" +
                                "<strong>Total:</strong> " + d.value) // Display country, year, and total value
                            .style("left", (event.pageX + 10) + "px") // Position the tooltip near the mouse
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mousemove", function (event, d) { // Update tooltip position on mousemove
                        tooltip
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function (event, d) { // Hide tooltip on mouseout
                        tooltip
                            .style("opacity", 0);
                    });

                // Optional: Add legend to the chart to indicate which color represents which country
                svg.selectAll(".legend")
                    .data(countries) // Bind countries to the legend items
                    .enter()
                    .append("text")
                    .attr("x", width + 40) // Position text to the right of the chart
                    .attr("y", function (d, i) { return 15 + i * 20; }) // Position each legend text vertically spaced apart
                    .text(function (d) { return d; }) // Display country name
                    .style("fill", function (d) { return color(d); }) // Set the color of the text based on the country
                    .style("font-size", "12px")
                    .attr("alignment-baseline", "middle");

                svg.selectAll(".legend-rect")
                    .data(countries) // Bind countries to the legend rectangles
                    .enter()
                    .append("rect")
                    .attr("x", width + 20) // Position the rectangle to the left of the corresponding text
                    .attr("y", function (d, i) { return i * 20 + 8; }) // Position each rectangle vertically spaced apart
                    .attr("width", 10) // Set rectangle width
                    .attr("height", 10) // Set rectangle height
                    .style("fill", function (d) { return color(d); }); // Set the fill color based on the country
            });
        },
        filterBySex() {
            // Get the selected value from the sex filter dropdown
            const selectedSex = document.getElementById('sexFilter').value;

            // Read the data from the CSV file again and filter by the selected gender
            d3.csv("data/WHO_CANCER_CASE_LINE_BAR.csv").then((data) => {
                // Convert 'Year' and 'Total' columns to numeric values
                data.forEach(function (d) {
                    d.Year = +d.Year; // Convert 'Year' to a number
                    d.Total = +d.Total; // Convert 'Total' to a number
                });

                // If a specific gender is selected (not "All"), filter the data accordingly
                if (selectedSex !== "All") {
                    data = data.filter(d => d.Sex === selectedSex); // Filter data by the selected gender
                }

                // Group the filtered data by 'Country' and 'Year', and sum up the 'Total' for each group
                var nestedData = d3.rollup(
                    data,
                    v => d3.sum(v, d => d.Total), // Calculate the sum of 'Total' for each group
                    d => d['Country label'], // Group by country
                    d => d.Year // Then group by year
                );

                // Prepare the data for plotting
                var countries = Array.from(nestedData.keys()); // Get the list of countries
                var dataReady = countries.map(function (country) {
                    var countryData = nestedData.get(country); // Get data for each country
                    var years = Array.from(countryData.keys()).sort(); // Get and sort the years for each country
                    var values = years.map(function (year) {
                        return { year: year, value: countryData.get(year), country: country }; // Prepare an entry for each year
                    });
                    return { country: country, values: values }; // Return the prepared data for each country
                });

                // Update scales to reflect the new data range
                var allYears = data.map(d => d.Year); // Extract all the years from the filtered dataset
                var x = d3.scaleLinear()
                    .domain(d3.extent(allYears)) // Set the X-axis domain from the minimum to maximum year
                    .range([0, $(".w-9\\/12").width() - 220]); // Set the range of the X-axis to fit within the chart width

                var maxTotal = d3.max(dataReady, function (c) {
                    return d3.max(c.values, function (d) { return d.value; }); // Find the maximum value across all countries
                });

                var y = d3.scaleLinear()
                    .domain([0, maxTotal]) // Set the Y-axis domain from 0 to the maximum total value
                    .range([400 - 60, 0]); // Set the range of the Y-axis (inverted, as SVG coordinates are top-left origin)

                // Select the existing SVG group containing lines and dots
                var svg = d3.select(this.$refs.chart).select('svg').select('g');

                // Define the line generator for the new data
                var line = d3.line()
                    .x(function (d) { return x(d.year); }) // Set X coordinate based on the year
                    .y(function (d) { return y(d.value); }); // Set Y coordinate based on the total value

                // Update the lines on the chart with transitions for a smooth update
                svg.selectAll(".line")
                    .data(dataReady) // Bind the updated data
                    .join(
                        // Handle new lines
                        enter => enter.append("path")
                            .attr("class", "line") // Add class for styling
                            .attr("fill", "none") // No fill for the lines
                            .attr("stroke", function (d) {
                                // Set stroke color based on country using D3's ordinal scale
                                return d3.scaleOrdinal().domain(countries).range(d3.schemeCategory10)(d.country);
                            })
                            .attr("stroke-width", 1.5) // Set stroke width
                            .attr("d", d => line(d.values)) // Use the line generator to set the path
                            .style("opacity", 0) // Start with opacity set to 0 (invisible)
                            .transition() // Apply a transition to animate appearance
                            .duration(1000) // Duration of the transition in milliseconds
                            .style("opacity", 1), // Fade the line in

                        // Handle updating existing lines
                        update => update
                            .transition() // Apply a transition for updates
                            .duration(1000) // Duration of the transition
                            .attr("d", d => line(d.values)) // Update the path for each line with new data values
                    );

                // Update the points (circles) on the chart with transitions
                const dots = svg.selectAll("circle")
                    .data(dataReady.flatMap(d => d.values)); // Flatten data for easy selection of individual points

                dots.join(
                    // Handle new points
                    enter => enter.append("circle")
                        .attr("r", 5) // Set the radius of the points
                        .attr("fill", d => d3.scaleOrdinal().domain(countries).range(d3.schemeCategory10)(d.country)) // Set fill color based on the country
                        .attr("cx", d => x(d.year)) // Set the X position based on the year
                        .attr("cy", d => y(d.value)) // Set the Y position based on the value
                        .style("opacity", 0) // Start with opacity set to 0 (invisible)
                        .transition() // Apply a transition to animate appearance
                        .duration(1000) // Duration of the transition in milliseconds
                        .style("opacity", 1), // Fade the point in

                    // Handle updating existing points
                    update => update
                        .transition() // Apply a transition for updates
                        .duration(1000) // Duration of the transition
                        .attr("cx", d => x(d.year)) // Update the X position for each point
                        .attr("cy", d => y(d.value)) // Update the Y position for each point
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