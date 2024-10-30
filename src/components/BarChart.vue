<template>
    <div class="mx-auto my-5 w-11/12 flex justify-center" @click="handleEmptySpaceClick">
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
            // Group data by country, then by year, then by cancer label, and finally by sex
            let groupedData = d3.group(
                data,
                d => d["Country label"],
                d => d["Year"],
                d => d["Cancer label"],
                d => d["Sex"]
            );

            // Helper function to create the desired data structure
            function buildHierarchicalData(groupedData) {
                let result = [];

                for (let [countryLabel, yearData] of groupedData) {
                    let countryTotalCount = 0;
                    let countryChildren = [];

                    for (let [year, cancerData] of yearData) {
                        let yearTotalCount = 0;
                        let yearChildren = [];

                        for (let [cancerLabel, sexData] of cancerData) {
                            let sexTotalCount = 0;
                            let sexChildren = [];

                            for (let [sex, d] of sexData) {
                                let total = parseInt(d[0].Total);
                                sexTotalCount += total;
                                sexChildren.push({
                                    name: sex,
                                    value: total
                                });
                            }

                            yearTotalCount += sexTotalCount;
                            yearChildren.push({
                                name: cancerLabel,
                                value: sexTotalCount,
                                children: sexChildren
                            });
                        }

                        countryTotalCount += yearTotalCount;
                        countryChildren.push({
                            name: year,
                            value: yearTotalCount,
                            children: yearChildren
                        });
                    }

                    result.push({
                        name: countryLabel,
                        value: countryTotalCount,
                        children: countryChildren
                    });
                }

                return result;
            }

            let hierarchicalData = buildHierarchicalData(groupedData);

            this.data = hierarchicalData;
            this.drawChart();
        });
        document.title = 'Bar Chart';
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
    },
    methods: {
        drawChart() {
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

            const margin = { top: 20, right: 20, bottom: 70, left: 70 }; // Increased bottom margin to accommodate labels
            const width = $(".w-11\\/12").width() * widthPercentage - margin.left - margin.right;
            const height = 600 - margin.top - margin.bottom;

            d3.select(this.$refs.chart).selectAll("svg").remove();

            const svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .on("click", this.handleEmptySpaceClick) // Add click handler to SVG
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Add a group for the label
            const labelGroup = svg.append("g")
                .attr("transform", `translate(${width / 2}, ${height + 50})`); // Position below x-axis

            // Add the label text element
            const layerLabel = labelGroup.append("text")
                .attr("class", "layer-label")
                .attr("text-anchor", "middle")
                .attr("fill", function () {
                    return localStorage.getItem('theme') === 'dark' ? 'white' : 'black';
                })
                .style("font-size", "14px")
                .text("Total cancer cases of each country"); // Initial label text

            this.currentData = this.data;
            const vm = this;

            // Initialize currentPath to keep track of navigation
            this.currentPath = [];

            function drawChart(data) {
                const x = d3.scaleBand()
                    .domain(data.map(d => d.name))
                    .range([0, width])
                    .padding(0.2);

                const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.value)])
                    .nice()
                    .range([height, 0]);

                vm.isTransitioning = true;

                svg.selectAll(".x-axis").remove();
                svg.selectAll(".y-axis").remove();

                svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", `translate(0, ${height})`)
                    .transition()
                    .duration(500)
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .attr("y", 10) // Adjust the y-position of the labels
                    .attr("x", 0)
                    .attr("transform", "rotate(0)") // Rotate the labels to 0 degrees
                    .style("text-anchor", "center"); // Center the labels under the bars

                svg.append("g")
                    .attr("class", "y-axis")
                    .transition()
                    .duration(500)
                    .call(d3.axisLeft(y))
                    .on("end", () => {
                        vm.isTransitioning = false;
                    });

                let bars = svg.selectAll(".bar")
                    .data(data, d => d.name);

                bars.exit()
                    .transition()
                    .duration(500)
                    .attr("y", height)
                    .attr("height", 0)
                    .remove()
                    .on("end", function() {
                        bars = svg.selectAll(".bar").data(data, d => d.name);
                        drawNewBars(bars, data);
                    });

                function drawNewBars(bars, data) {
                    const tooltip = d3.select("body").append("div")
                        .attr("id", "tooltip")
                        .style("position", "absolute")
                        .style("opacity", 0)
                        .style("background", "lightsteelblue")
                        .style("padding", "8px")
                        .style("border-radius", "4px")
                        .style("pointer-events", "none");


                    bars.transition()
                        .duration(500)
                        .attr("x", d => x(d.name))
                        .attr("y", d => y(d.value))
                        .attr("width", x.bandwidth())
                        .attr("height", d => height - y(d.value));

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
                                // Push current state onto the stack, including currentPath
                                vm.previousDataStack.push({ data: vm.currentData, path: [...vm.currentPath] });
                                vm.currentData = d.children;
                                vm.currentPath.push(d); // Add the clicked node to currentPath
                                vm.isTransitioning = true;
                                drawChart(vm.currentData);
                            } else {
                                event.stopPropagation();
                            }
                        })
                        .on("mouseover", function (event, d) {
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
                            tooltip.style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function (event, d) {
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
                            vm.isTransitioning = false;
                        });
                }

                if (bars.exit().empty()) {
                    drawNewBars(bars, data);
                }

                // Update the label text based on the current path
                layerLabel.text(getLabelText(vm.currentPath));
            }

            // Function to construct the label text based on currentPath
            function getLabelText(path) {
                if (path.length === 0) {
                    return "Total cancer cases of each country";
                } else if (path.length === 1) {
                    // First drill-down level: Country selected
                    return `Yearly Cancer Cases in ${path[0].name}`;
                } else if (path.length === 2) {
                    // Second drill-down level: Year selected
                    return `Total Cancer Cases for each type in ${path[0].name} (${path[1].name})`;
                } else if (path.length === 3) {
                    // Third drill-down level: Cancer type selected
                    return `Cancer Cases by Gender for ${path[2].name} in ${path[0].name} (${path[1].name})`;
                } else {
                    // Further drill-down levels (if any)
                    return `Data for ${path.map(p => p.name).join(' > ')}`;
                }
            }

            // Initialize previousDataStack to store both data and path
            this.previousDataStack = [];

            this.handleEmptySpaceClick = (e) => {
                if (!this.isTransitioning && this.previousDataStack.length > 0 && e.srcElement.nodeName === 'svg') {
                    const previousState = this.previousDataStack.pop();
                    this.currentData = previousState.data;
                    this.currentPath = previousState.path;
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