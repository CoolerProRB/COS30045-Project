<template>
    <div class="w-full text-center">
        <h1 class="text-5xl">Turning Points: Comparing Respiratory Cancer Incidence in Pivotal Years</h1>
    </div>
    <div class="w-6/12 mx-auto my-3 text-center">
        <p>
            Every few years, significant events reshape the landscape of health and disease. Our stacked bar chart highlights four pivotal years—2000, 2002, 2008, and 2012—offering a
            comparative lens on how respiratory cancer incidence has shifted within these snapshots. Picture each bar as a storybook page, segmented by cancer type, narrating the changes
            and continuities across six countries. These key years serve as milestones, marking moments of triumph, struggle, and transformation. By comparing these snapshots, we gain insights
            into the effectiveness of interventions, the emergence of new risks, and the resilience of populations in the face of respiratory cancer.
        </p>
    </div>
    <div class="mx-auto my-5 w-9/12 dark:bg-gray-700 dark:border-gray-500 border">
        <div class="text-center py-2 border-b dark:border-gray-500">
            <p class="font-bold">Stacked Bar Chart of Respiratory Cancer Incidence (2000, 2002, 2008, 2012)</p>
        </div>
        <div class="mx-auto my-5 w-9/12 flex justify-center items-center">
            <span class="pe-2">Gender: </span>
            <select v-model="selectedSex" class="bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded">
                <option value="Total">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
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
    data() {
        return {
            selectedSex: 'Total', // Default selection
            mygroups: ["United Kingdom", "United States", "France", "Germany", "Korea", "Japan"],
            mysubgroups: ["2000", "2002", "2008", "2012"]
        };
    },
    mounted() {
        this.drawChart(this.selectedSex);
        document.title = 'Stacked Area Chart';
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
    },
    watch: {
        selectedSex(newSex) {
            this.drawChart(newSex);
        }
    },
    methods: {
        drawChart(selectedSex) {
            // Clear any existing chart content
            d3.select(this.$refs.chart).selectAll("*").remove();

            // Set the dimensions and margins of the graph
            const margin = { top: 10, right: 30, bottom: 60, left: 60 },
                width = $(".w-9\\/12").width() - margin.left - margin.right, // Set chart width based on container width minus margins
                height = 400 - margin.top - margin.bottom; // Set chart height minus margins

            // Append the SVG object to the chart container
            const svg = d3.select(this.$refs.chart) // Select container where chart will be placed
                .append("svg") // Append an SVG element
                .attr("width", width + margin.left + margin.right) // Set total SVG width including margins
                .attr("height", height + margin.top + margin.bottom) // Set total SVG height including margins
                .append("g") // Append a group element for applying margins
                .attr("transform", `translate(${margin.left}, ${margin.top})`); // Translate group element to respect margins

            // Create a tooltip div for showing data on hover
            const tooltip = d3.select(this.$refs.chart) // Select the chart container
                .append("div") // Append a div for the tooltip
                .attr("id", "tooltip") // Set the tooltip ID
                .style("position", "absolute") // Set tooltip position to absolute
                .style("opacity", 0) // Initially hide tooltip
                .attr("class", "bg-gray-100 dark:bg-gray-700") // Add classes for tooltip styling
                .style("border", "1px solid #ccc") // Add a border for the tooltip
                .style("padding", "5px") // Add padding inside the tooltip
                .style("pointer-events", "none") // Disable pointer events to avoid conflicts during mouse movements
                .style("border-radius", "3px"); // Add rounded corners to the tooltip

            // Read the CSV data
            d3.csv("data/OECD_CANCER_STACKED_BAR.csv").then(function (data) {
                // Convert numeric values and clean country names
                data.forEach(function (d) {
                    d.OBS_VALUE = +d.OBS_VALUE; // Convert 'OBS_VALUE' to a number
                    d.TIME_PERIOD = +d.TIME_PERIOD; // Convert 'TIME_PERIOD' to a number
                    d["Reference area"] = d["Reference area"].trim(); // Remove extra spaces from 'Reference area'
                });

                // Filter the data for the desired years and the selected gender
                data = data.filter(function (d) {
                    return [2000, 2002, 2008, 2012].includes(d.TIME_PERIOD) && d.Sex === selectedSex; // Filter by specific years and selected gender
                });

                // Update the country names for grouping
                const mygroups = ["United Kingdom", "United States", "France", "Germany", "Korea", "Japan"]; // List of countries to be included

                // Get the list of years (as strings) for stacking
                const mysubgroups = ["2000", "2002", "2008", "2012"];

                // Prepare the data for stacking by country and year
                const dataByCountry = d3.rollups(
                    data,
                    v => {
                        let obj = {};
                        mysubgroups.forEach(year => {
                            const yearData = v.find(d => d.TIME_PERIOD === +year); // Find data for each year
                            obj[year] = yearData ? yearData.OBS_VALUE : 0; // Assign value or set to 0 if not found
                        });
                        return obj; // Return object with values for each year
                    },
                    d => d["Reference area"] // Group by country name
                );

                // Map the grouped data into the correct dataset format for stacking
                const dataset = dataByCountry.map(([country, values]) => {
                    return { country: country, ...values }; // Create an object for each country with its values
                });

                // Filter dataset to include only the specified countries
                const filteredDataset = dataset.filter(d => mygroups.includes(d.country));

                // Stack the data for each year
                const stackedData = d3.stack()
                    .keys(mysubgroups) // Stack by years
                    (filteredDataset);

                // Add X axis for countries
                const x = d3.scaleBand()
                    .domain(mygroups) // Set domain to country names
                    .range([0, width]) // Set range from left to right
                    .padding(0.2); // Add padding between bars

                svg.append("g")
                    .attr("transform", `translate(0, ${height})`) // Position x-axis at the bottom of the chart
                    .call(d3.axisBottom(x).tickSize(0)) // Draw the x-axis
                    .selectAll("text")
                    .attr("dy", "1em"); // Adjust y position of the labels

                // Add x-axis label
                svg.append("text")
                    .attr("class", "label") // Add a class for styling
                    .attr("text-anchor", "middle")
                    .attr("fill", function () {
                        return localStorage.getItem('theme') === 'dark' ? 'white' : 'black'; // Set label color based on theme
                    })
                    .attr("x", width / 2) // Center the label horizontally
                    .attr("y", height + margin.bottom - 20) // Position the label below the x-axis
                    .text("Cancer Cases per 100000 persons by Gender"); // Set label text

                // Add Y axis for values
                const yMax = d3.max(stackedData[stackedData.length - 1], d => d[1]); // Get maximum value across stacked data
                const y = d3.scaleLinear()
                    .domain([0, yMax]) // Set domain from 0 to the maximum value
                    .range([height, 0]); // Invert range (SVG y-axis starts from the top)

                svg.append("g")
                    .call(d3.axisLeft(y)); // Draw the y-axis on the left

                // Define the color palette for the bars
                const color = d3.scaleOrdinal()
                    .domain(mysubgroups) // Set domain to the list of years
                    .range(d3.schemeTableau10); // Use Tableau color scheme for distinct colors

                // Group bars for each year's data and apply transitions for a smooth update
                const barsGroup = svg.append("g");

                function updateBars() {
                    // Bind the stacked data to groups and enter new groups
                    const groups = barsGroup.selectAll("g")
                        .data(stackedData);

                    // Enter new groups and set fill color for each year
                    const groupsEnter = groups.enter().append("g")
                        .attr("fill", function (d) { return color(d.key); });

                    // Append rect elements for each bar within the groups
                    groupsEnter.selectAll("rect")
                        .data(function (d) { return d; }) // Bind data for each year
                        .enter().append("rect")
                        .attr("x", function (d) { return x(d.data.country); }) // Set x position based on country
                        .attr("y", height) // Start from the bottom for transition effect
                        .attr("height", 0) // Start with height 0 for transition effect
                        .attr("width", x.bandwidth()) // Set bar width
                        .on("mouseover", function (event, d) { // Tooltip on mouseover
                            tooltip.style("opacity", 0.9); // Make tooltip visible
                            d3.select(this).style("stroke", function () { // Highlight bar with stroke
                                return localStorage.getItem('theme') === 'dark' ? 'white' : 'black';
                            });
                        })
                        .on("mousemove", function (event, d) { // Update tooltip position and content on mousemove
                            const country = d.data.country; // Get country name
                            const year = d3.select(this.parentNode).datum().key; // Get year from parent group
                            const value = d.data[year]; // Get value for the year

                            tooltip.html(`<strong>Country:</strong> ${country}<br>
                       <strong>Year:</strong> ${year}<br>
                       <strong>Value:</strong> ${value}`) // Set tooltip content
                                .style("left", (event.pageX + 10) + "px") // Set tooltip x position
                                .style("top", (event.pageY - 28) + "px"); // Set tooltip y position
                        })
                        .on("mouseout", function () { // Hide tooltip on mouseout
                            tooltip.style("opacity", 0);
                            d3.select(this).style("stroke", "none"); // Remove bar stroke
                        });

                    // Update existing bars with transition
                    groupsEnter.merge(groups).selectAll("rect")
                        .transition() // Apply transition for smooth changes
                        .duration(750) // Set transition duration in milliseconds
                        .attr("y", function (d) { return y(d[1]); }) // Set y position based on value
                        .attr("height", function (d) { return y(d[0]) - y(d[1]); }); // Calculate bar height from the stack values

                    // Remove old bars that are no longer needed
                    groups.exit().remove(); // Remove groups not present in new data
                }

                // Call the function to update bars
                updateBars();
            });
        },
        updateChartColor() {
            let theme = localStorage.getItem('theme') || 'light';
            let color = theme === 'dark' ? 'white' : 'black';

            const svg = d3.select(this.$refs.chart).select('svg');

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