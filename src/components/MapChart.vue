<template>
    <div class="mx-auto w-full">
        <div ref="chart"></div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import eventBus from '@/eventBus';

export default {
    data() {
        return {
            theme: localStorage.getItem('theme') || 'light',
            colors: {
                light: {
                    malaysia: '#fc8d62',
                    australia: '#66c2a5'
                },
                dark: {
                    malaysia: '#ff7f0e',
                    australia: '#1f77b4'
                }
            }
        }
    },
    mounted() {
        this.drawChart();
        document.title = 'Map Chart';
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
    },
    methods: {
        drawChart() {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Set up the SVG canvas dimensions
            const width = screenWidth * 0.9;
            const height = 1000;

            const countryList = ["Singapore", "Malaysia", "Australia"];

            // Store reference to the Vue instance
            const _this = this;

            // Create an SVG element to draw the map
            const svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            // Set up a projection and path generator
            const projection = d3.geoMercator()
                .center([133, -15]) // Adjusted center for better visibility of both countries
                .scale(500) // Adjust scale for appropriate zoom level
                .translate([width / 2, height / 2]);

            const path = d3.geoPath().projection(projection);

            // Load GeoJSON data for the world
            d3.json("/COS30045-Project/data/geo.json").then((data) => {
                if (!data || !data.features) {
                    console.error("Invalid GeoJSON data");
                    return;
                }
                // Filter data to include only Australia and Malaysia
                const countries = data.features.filter((d) => {
                    return countryList.includes(d.properties.name);
                });

                if (countries.length === 0) {
                    console.error("No data found for Australia or Malaysia");
                    return;
                }

                // Draw the countries
                svg.selectAll(".country")
                    .data(countries)
                    .enter()
                    .append("path")
                    .attr("class", "country")
                    .attr("d", path)
                    .style("fill", (d) => {
                        return d.properties.name === "Singapore" ? _this.colors[_this.theme].australia : _this.colors[_this.theme].malaysia;
                    })
                    .on("mouseover", function (event, d) {
                        // Change fill color
                        d3.select(this).style("fill", "red");

                        // Add country label
                        svg.append("text")
                            .attr("class", "country-label")
                            .attr("x", path.centroid(d)[0])
                            .attr("y", path.centroid(d)[1])
                            .text(d.properties.name)
                            .style("fill", "white")
                            .style("font-size", "12px")
                            .attr("text-anchor", "middle");
                    })
                    .on("mouseout", function (event, d) {
                        // Use the stored reference to the Vue instance to get the color
                        const color = d.properties.name === "Australia" ? _this.colors[_this.theme].australia : _this.colors[_this.theme].malaysia;
                        d3.select(this).style("fill", color);

                        // Remove country label
                        svg.selectAll(".country-label").remove();
                    });

            }).catch((error) => {
                console.error("Error loading the GeoJSON data: ", error);
            });
        },
        updateChartColor() {
            let theme = localStorage.getItem('theme') || 'light';
            this.theme = theme;
            let color = theme === 'dark' ? 'white' : 'black';
            d3.selectAll(".country").style("fill", (d) => {
                return d.properties.name === "Australia" ? this.colors[this.theme].australia : this.colors[this.theme].malaysia;
            });
        }
    }
}
</script>

<style>

</style>