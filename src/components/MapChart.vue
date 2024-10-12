<template>
    <div class="mx-auto my-5 w-11/12" style="height: 500px;">
        <div ref="chart" class="flex justify-center items-center"></div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import eventBus from '@/eventBus';
import $ from 'jquery';

export default {
    data() {
        return {
            theme: localStorage.getItem('theme') || 'light',
            colors: {
                light: {
                    malaysia: '#fc8d62',
                    australia: '#66c2a5',
                    singapore: '#8da0cb'
                },
                dark: {
                    malaysia: '#ff7f0e',
                    australia: '#1f77b4',
                    singapore: '#9467bd'
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
            // Set up the SVG canvas dimensions
            const width = $(".w-11\\/12").width();
            const height = 500;

            const countryList = ["Singapore", "Malaysia", "Australia", "Indonesia", "Philippines", "Thailand", "Vietnam", "Myanmar", "Cambodia", "Laos", "Brunei", "China"];

            // Store reference to the Vue instance
            const _this = this;

            // Create an SVG element to draw the map
            const svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width)
                .attr("height", height);

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

                const projection = d3.geoMercator()
                    .fitSize([width, height], { type: "FeatureCollection", features: countries });

                const path = d3.geoPath().projection(projection);

                // Draw the countries
                svg.selectAll(".country")
                    .data(countries)
                    .enter()
                    .append("path")
                    .attr("class", "country")
                    .attr("d", path)
                    .attr("id", (d) => {
                        return d.properties.name.toLowerCase().replaceAll(" ", "_");
                    })
                    .style("fill", (d) => {
                        return _this.colors[_this.theme][d.properties.name.toLowerCase().replaceAll(" ", "_")];
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
                        const color = _this.colors[_this.theme][d.properties.name.toLowerCase()];
                        d3.select(this).style("fill", color);

                        // Remove country label
                        svg.selectAll(".country-label").remove();
                    });

            }).catch((error) => {
                alert("Error loading the GeoJSON data: " + error);
            });
        },
        updateChartColor() {
            const _this = this;

            let theme = localStorage.getItem('theme') || 'light';
            this.theme = theme;
            let color = theme === 'dark' ? 'white' : 'black';
            d3.selectAll(".country").style("fill", (d) => {
                return _this.colors[_this.theme][d.properties.name.toLowerCase()];
            });
        }
    }
}
</script>

<style>

</style>