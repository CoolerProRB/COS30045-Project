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
            d3.select(this.$refs.chart).selectAll("*").remove();

            // Set the dimensions and margins of the graph
            const margin = { top: 10, right: 30, bottom: 60, left: 60 },
                width = $(".w-9\\/12").width() - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            // Append the SVG object to the body of the page
            const svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            // Create a tooltip div
            const tooltip = d3.select(this.$refs.chart)
                .append("div")
                .attr("id", "tooltip")
                .style("position", "absolute")
                .style("opacity", 0)
                .attr("class", "bg-gray-100 dark:bg-gray-700")
                .style("border", "1px solid #ccc")
                .style("padding", "5px")
                .style("pointer-events", "none")
                .style("border-radius", "3px");

            // Read the data
            d3.csv("data/OECD_CANCER_STACKED_BAR.csv").then(function (data) {
                // Convert numeric values and clean country names
                data.forEach(function (d) {
                    d.OBS_VALUE = +d.OBS_VALUE;
                    d.TIME_PERIOD = +d.TIME_PERIOD;
                    d["Reference area"] = d["Reference area"].trim(); // Remove extra spaces
                });

                // Filter the data for the desired years and sexes
                data = data.filter(function (d) {
                    return [2000, 2002, 2008, 2012].includes(d.TIME_PERIOD) && d.Sex === selectedSex;
                });

                // Update mygroups to match the country names in your data
                const mygroups = ["United Kingdom", "United States", "France", "Germany", "Korea", "Japan"];

                // Get the list of years (as strings)
                const mysubgroups = ["2000", "2002", "2008", "2012"];

                // Prepare the data for stacking
                const dataByCountry = d3.rollups(
                    data,
                    v => {
                        let obj = {};
                        mysubgroups.forEach(year => {
                            const yearData = v.find(d => d.TIME_PERIOD === +year);
                            obj[year] = yearData ? yearData.OBS_VALUE : 0;
                        });
                        return obj;
                    },
                    d => d["Reference area"] // Use exact country names
                );

                // Map and filter the dataset
                const dataset = dataByCountry.map(([country, values]) => {
                    return { country: country, ...values };
                });

                // Filter dataset to include only the countries in mygroups
                const filteredDataset = dataset.filter(d => mygroups.includes(d.country));

                // Stack the data
                const stackedData = d3.stack()
                    .keys(mysubgroups)
                    (filteredDataset);

                // Add X axis (countries)
                const x = d3.scaleBand()
                    .domain(mygroups)
                    .range([0, width])
                    .padding(0.2);

                svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x).tickSize(0))
                    .selectAll("text")
                    .attr("dy", "1em");

                // Add x-axis label
                svg.append("text")
                    .attr("class", "label")
                    .attr("text-anchor", "middle")
                    .attr("fill", function () {
                        return localStorage.getItem('theme') === 'dark' ? 'white' : 'black';
                    })
                    .attr("x", width / 2)
                    .attr("y", height + margin.bottom - 20) // Adjust '-20' as needed
                    .text("Cancer Cases per 100000 persons by Gender");


                // Add Y axis
                const yMax = d3.max(stackedData[stackedData.length - 1], d => d[1]);
                const y = d3.scaleLinear()
                    .domain([0, yMax])
                    .range([height, 0]);

                svg.append("g")
                    .call(d3.axisLeft(y));


                // Define the color palette
                const color = d3.scaleOrdinal()
                    .domain(mysubgroups)
                    .range(d3.schemeTableau10);

                // Show the bars with transition
                const barsGroup = svg.append("g");

                function updateBars() {
                    // Bind data to groups and enter new groups
                    const groups = barsGroup.selectAll("g")
                        .data(stackedData);

                    const groupsEnter = groups.enter().append("g")
                        .attr("fill", function(d) { return color(d.key); });

                    groupsEnter.selectAll("rect")
                        .data(function(d) { return d; })
                        .enter().append("rect")
                        .attr("x", function(d) { return x(d.data.country); })
                        .attr("y", height) // Start from bottom for transition effect
                        .attr("height", 0) // Start with height 0 for transition effect
                        .attr("width", x.bandwidth())
                        .on("mouseover", function(event, d) {
                            tooltip.style("opacity", 0.9);
                            d3.select(this).style("stroke", function () {
                                return localStorage.getItem('theme') === 'dark' ? 'white' : 'black';
                            });
                        })
                        .on("mousemove", function(event, d) {
                            const country = d.data.country;
                            const year = d3.select(this.parentNode).datum().key;
                            const value = d.data[year];

                            tooltip.html(`<strong>Country:</strong> ${country}<br>
                       <strong>Year:</strong> ${year}<br>
                       <strong>Value:</strong> ${value}`)
                                .style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function() {
                            tooltip.style("opacity", 0);
                            d3.select(this).style("stroke", "none");
                        });

                    // Update existing bars with transition
                    groupsEnter.merge(groups).selectAll("rect")
                        .transition()
                        .duration(750)
                        .attr("y", function(d) { return y(d[1]); })
                        .attr("height", function(d) { return y(d[0]) - y(d[1]); });

                    // Remove old bars that are no longer needed
                    groups.exit().remove();
                }

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