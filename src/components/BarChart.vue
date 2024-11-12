<template>
    <div class="w-full text-center">
        <h1 class="text-5xl">Behind the Numbers: Unveiling Types and Faces of Respiratory Cancer</h1>
    </div>
    <div class="w-6/12 mx-auto my-3 text-center">
        <p>
            Dive deeper into the mosaic of respiratory cancer with our hierarchical bar chart, where each layer reveals more about the disease's intricate patterns.
            Imagine peeling back the layers to uncover the various types of respiratory cancer, the years they surged, the countries most affected, and the genders most impacted.
            This detailed exploration brings to life the diversity within the statistics, showing how different cancer types manifest across populations and geographies. As you interact
            with the chart, you'll uncover stories of disparity and resilience, gaining a nuanced understanding of who is most vulnerable and why.
        </p>
    </div>
    <div class="mx-auto my-5 w-9/12 dark:bg-gray-800 dark:border-gray-600 border py-3" @click="handleEmptySpaceClick">
        <div class="text-center pb-3 border-b dark:border-gray-500">
            <p class="font-bold">Hierarchical Breakdown of Respiratory Cancer Incidence</p>
        </div>
        <div class="mx-auto my-5 w-9/12 flex justify-center">
            <p class="text-gray-400 text-sm">(Press blue bar for detailed information, press blank area to exit.)</p>
        </div>
        <div ref="chart" class="cursor-pointer"></div>
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
            },
            data: null
        };
    },
    mounted() {
        d3.csv("data/WHO_CANCER_CASE_LINE_BAR.csv").then((data) => {
            // Group data hierarchically by country, then by year, cancer type, and sex
            let groupedData = d3.group(
                data,
                d => d["Country label"], // Top-level grouping by country
                d => d["Year"],          // Second-level grouping by year
                d => d["Cancer label"],  // Third-level grouping by type of cancer
                d => d["Sex"]            // Fourth-level grouping by sex
            );

            // Helper function to convert grouped data into a hierarchical structure
            function buildHierarchicalData(groupedData) {
                let result = [];

                // Iterate over each country-level entry in the grouped data
                for (let [countryLabel, yearData] of groupedData) {
                    let countryTotalCount = 0; // Initialize total count for the country
                    let countryChildren = [];  // Container for child nodes representing the years

                    // Iterate over each year-level entry for a given country
                    for (let [year, cancerData] of yearData) {
                        let yearTotalCount = 0; // Initialize total count for the year
                        let yearChildren = [];  // Container for child nodes representing the cancer types

                        // Iterate over each cancer type for a given year
                        for (let [cancerLabel, sexData] of cancerData) {
                            let sexTotalCount = 0; // Initialize total count for each cancer type
                            let sexChildren = [];  // Container for child nodes representing gender

                            // Iterate over each gender entry for a cancer type
                            for (let [sex, d] of sexData) {
                                let total = parseInt(d[0].Total); // Extract and parse the total count
                                sexTotalCount += total; // Update the count for the specific sex
                                sexChildren.push({
                                    name: sex,  // The name of the gender group
                                    value: total // The value representing the total count
                                });
                            }

                            yearTotalCount += sexTotalCount; // Update the year total count
                            yearChildren.push({
                                name: cancerLabel,   // The name of the cancer type
                                value: sexTotalCount, // The total count across all genders
                                children: sexChildren // Add children for male and female cases
                            });
                        }

                        countryTotalCount += yearTotalCount; // Update the country total count
                        countryChildren.push({
                            name: year,           // The name of the year
                            value: yearTotalCount, // Total count for the year
                            children: yearChildren // Add children representing different cancer types
                        });
                    }

                    // Push the final structure for each country into the result array
                    result.push({
                        name: countryLabel,       // Country name
                        value: countryTotalCount, // Total count of all cases for the country
                        children: countryChildren // Yearly data for the country
                    });
                }

                return result; // Return the hierarchical data structure
            }

            // Create the hierarchical data for visualization
            // Set the hierarchical data to the Vue instance's `data` property
            this.data = buildHierarchicalData(groupedData);

            // Draw the initial chart
            this.drawChart();
        });

        // Listen to the 'themeChanged' event via the event bus to update chart colors accordingly
        eventBus.on('themeChanged', this.updateChartColor);
    },

    beforeUnmount() {
        // Clean up the event listener when the component is destroyed
        eventBus.off('themeChanged', this.updateChartColor);
    },

    methods: {
        drawChart() {
            let widthPercentage = 1;

            // Adjust the width percentage of the chart based on screen size for responsiveness
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

            // Set up the margins, width, and height for the SVG chart container
            const margin = { top: 20, right: 20, bottom: 70, left: 70 };
            const width = $(".w-9\\/12").width() - margin.left - margin.right;
            const height = 600 - margin.top - margin.bottom;

            // Remove any existing SVG elements before re-drawing the chart to avoid duplication
            d3.select(this.$refs.chart).selectAll("svg").remove();

            // Create a new SVG element to hold the chart
            const svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .on("click", this.handleEmptySpaceClick) // Add click event handler to handle empty space clicks
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Create a group for the label below the x-axis to indicate chart context
            const labelGroup = svg.append("g")
                .attr("transform", `translate(${width / 2}, ${height + 50})`);

            // Add the label text, setting it to show initial chart information
            const layerLabel = labelGroup.append("text")
                .attr("class", "layer-label")
                .attr("text-anchor", "middle")
                .attr("fill", function () {
                    return localStorage.getItem('theme') === 'dark' ? 'white' : 'black';
                })
                .style("font-size", "14px")
                .text("Total cancer cases of each country (2000 - 2012)");

            // Set the current data for drawing the chart initially
            this.currentData = this.data;

            const vm = this;

            // Initialize currentPath to keep track of drill-down navigation
            this.currentPath = [];

            // Function to draw the bar chart based on the data provided
            function drawChart(data) {
                // Set up scales for the x and y axes based on data
                const x = d3.scaleBand()
                    .domain(data.map(d => d.name)) // Set domain to the names of the data
                    .range([0, width]) // Set range to the chart width
                    .padding(0.2); // Add padding between bars

                const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.value)]) // Set domain to the data value range
                    .nice() // Round up domain for better axis labels
                    .range([height, 0]); // Set range to chart height (y=0 at the bottom)

                vm.isTransitioning = true; // Indicate that the chart is currently transitioning

                // Remove existing axes to re-draw with new data
                svg.selectAll(".x-axis").remove();
                svg.selectAll(".y-axis").remove();

                // Draw the x-axis with labels for each data point
                svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", `translate(0, ${height})`)
                    .transition()
                    .duration(500)
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .attr("y", 10)
                    .attr("x", 0)
                    .attr("transform", "rotate(0)")
                    .style("text-anchor", "center");

                // Draw the y-axis for data values
                svg.append("g")
                    .attr("class", "y-axis")
                    .transition()
                    .duration(500)
                    .call(d3.axisLeft(y))
                    .on("end", () => {
                        vm.isTransitioning = false; // Set transition state to false once done
                    });

                // Select bars and bind data
                let bars = svg.selectAll(".bar")
                    .data(data, d => d.name);

                // Handle the exit selection by animating the removal of bars that are no longer needed
                bars.exit()
                    .transition()
                    .duration(500)
                    .attr("y", height)
                    .attr("height", 0)
                    .remove()
                    .on("end", function() {
                        bars = svg.selectAll(".bar").data(data, d => d.name);
                        drawNewBars(bars, data); // Re-draw new bars if any remain
                    });

                // Function to draw new bars with the given data
                function drawNewBars(bars, data) {
                    // Create a tooltip to display the value of each bar on hover
                    const tooltip = d3.select("body").append("div")
                        .attr("id", "tooltip")
                        .style("position", "absolute")
                        .style("opacity", 0)
                        .attr("class", "text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-2 rounded")
                        .style("padding", "8px")
                        .style("border-radius", "4px")
                        .style("pointer-events", "none");

                    // Animate the existing bars to their new positions and sizes
                    bars.transition()
                        .duration(500)
                        .attr("x", d => x(d.name))
                        .attr("y", d => y(d.value))
                        .attr("width", x.bandwidth())
                        .attr("height", d => height - y(d.value));

                    // Create and animate new bars
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
                            // Handle click event to drill down into data if there are children nodes
                            if (!vm.isTransitioning && d.children) {
                                event.stopPropagation();
                                vm.previousDataStack.push({ data: vm.currentData, path: [...vm.currentPath] }); // Save current state
                                vm.currentData = d.children; // Set the current data to children of clicked bar
                                vm.currentPath.push(d); // Add to navigation path
                                vm.isTransitioning = true; // Set transitioning state
                                drawChart(vm.currentData); // Draw the updated chart
                            } else {
                                event.stopPropagation();
                            }
                        })
                        .on("mouseover", function (event, d) {
                            // Show tooltip with value and change fill color on mouseover
                            tooltip.transition()
                                .duration(200)
                                .style("opacity", 0.9);
                            tooltip.html(`Value: ${d.value}`)
                                .style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 28) + "px");

                            if (d.children) {
                                d3.select(this).attr("fill", vm.colors[localStorage.getItem('theme')].hover);
                            }
                        })
                        .on("mousemove", function (event) {
                            // Update tooltip position on mousemove
                            tooltip.style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function (event, d) {
                            // Hide tooltip and reset fill color on mouseout
                            tooltip.transition()
                                .duration(200)
                                .style("opacity", 0);

                            if (d.children) {
                                d3.select(this).attr("fill", d => d.children ? vm.colors[localStorage.getItem('theme')].bar_with_child : vm.colors[localStorage.getItem('theme')].bar_without_child);
                            }
                        })
                        .transition()
                        .duration(500)
                        .attr("y", d => y(d.value))
                        .attr("height", d => height - y(d.value))
                        .on("end", () => {
                            vm.isTransitioning = false; // Reset transitioning state after animation ends
                        });
                }

                // Draw new bars if no bars need exiting
                if (bars.exit().empty()) {
                    drawNewBars(bars, data);
                }

                // Update the label text to reflect the current drill-down state
                layerLabel.text(getLabelText(vm.currentPath));
            }

            // Function to generate label text based on the current drill-down path
            function getLabelText(path) {
                if (path.length === 0) {
                    return "Total cancer cases of each country (2000 - 2012)";
                } else if (path.length === 1) {
                    return `Yearly Cancer Cases in ${path[0].name}`;
                } else if (path.length === 2) {
                    return `Total Cancer Cases for each type in ${path[0].name} (${path[1].name})`;
                } else if (path.length === 3) {
                    return `Cancer Cases by Gender for ${path[2].name} in ${path[0].name} (${path[1].name})`;
                } else {
                    return `Data for ${path.map(p => p.name).join(' > ')}`;
                }
            }

            // Initialize the stack to store previous data and paths for navigating back
            this.previousDataStack = [];

            // Handle click event on empty space to navigate back up the hierarchy
            this.handleEmptySpaceClick = (e) => {
                if (!this.isTransitioning && this.previousDataStack.length > 0 && e.srcElement.nodeName === 'svg') {
                    const previousState = this.previousDataStack.pop(); // Retrieve the previous state from stack
                    this.currentData = previousState.data; // Set the current data to previous data
                    this.currentPath = previousState.path; // Set the current path to previous path
                    this.isTransitioning = true; // Set transitioning state
                    drawChart(this.currentData); // Re-draw the chart
                }
            };

            // Draw the initial chart
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