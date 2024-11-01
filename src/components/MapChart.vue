<template>
    <div class="w-full text-center">
        <h1 class="text-5xl">Mapping the Shadows: Where Respiratory Cancer Takes Hold</h1>
    </div>
    <div class="w-6/12 mx-auto my-3 text-center">
        <p>
            Our story begins on a global stage. Picture a map that not only outlines borders but also marks the silent spread of respiratory cancer. This interactive map reveals the hotspots and the quieter regions,
            showcasing where the disease has cast its longest shadows. As you explore, notice the countries grappling with higher incidences and those where the battle seems less fierce. This geographical snapshot sets the foundation,
            highlighting the diverse landscapes where respiratory cancer thrives and hinting at the underlying factors that contribute to its prevalence.
        </p>
    </div>
    <div class="mx-auto my-5 w-9/12 dark:bg-gray-700 dark:border-gray-500 border py-1" style="min-height: 500px;">
        <div class="text-center py-2 border-b dark:border-gray-500">
            <p class="font-bold">Worldwide Respiratory Cancer Incidence Map (2000-2012)</p>
        </div>
        <div ref="legend" class="flex justify-center items-center mt-4"></div>
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
                    france: '#fc8d62',
                    united_states_of_america: '#66c2a5',
                    united_kingdom: '#8da0cb',
                    south_korea: '#e78ac3',
                    japan: '#a6d854',
                    germany: '#ffd92f'
                },
                dark: {
                    france: '#ff7f0e',
                    united_states_of_america: '#1f77b4',
                    united_kingdom: '#9467bd',
                    south_korea: '#d62728',
                    japan: '#2ca02c',
                    germany: '#ffbb78'
                }
            },
            countryData: {}
        };
    },
    mounted() {
        this.drawChart();
        document.title = 'Map Chart';
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
        // Clean up legend
        d3.select(this.$refs.legend).selectAll('*').remove();
    },
    methods: {
        drawLegend() {
            const legendContainer = d3.select(this.$refs.legend);
            legendContainer.selectAll('*').remove();

            const legendWidth = 600;
            const legendHeight = 50;

            const svg = legendContainer
                .append('svg')
                .attr('width', legendWidth)
                .attr('height', legendHeight);

            const countries = ['France', 'United States of America', 'United Kingdom', 'South Korea', 'Japan', 'Germany'];
            const legendItemWidth = legendWidth / countries.length;

            const legendItems = svg.selectAll('.legend-item')
                .data(countries)
                .enter()
                .append('g')
                .attr('class', 'legend-item')
                .attr('transform', (d, i) => `translate(${i * legendItemWidth}, 0)`);

            // Add colored rectangles
            legendItems.append('rect')
                .attr('x', 5)
                .attr('y', 5)
                .attr('width', 20)
                .attr('height', 20)
                .style('fill', (d) => this.colors[this.theme][d.toLowerCase().replaceAll(' ', '_')]);

            // Add country names
            legendItems.append('text')
                .attr('x', 30)
                .attr('y', 20)
                .text(d => {
                    if (d === 'United States of America') {
                        return 'USA';
                    }
                    else if (d === 'United Kingdom') {
                        return 'UK';
                    }
                    else if (d === 'South Korea') {
                        return 'Korea';
                    }
                    return d;
                })
                .style('font-size', '12px')
                .attr('fill', function (d) {
                    let theme = localStorage.getItem('theme') || 'light';
                    return theme === 'dark' ? 'white' : 'black';
                });
        },
        drawChart() {
            const width = $('.w-9\\/12').width();
            const height = width * 0.6;

            const countryList = ['South Korea', 'Japan', 'Germany', 'United Kingdom', 'United States of America', 'France', "Canada", "Australia", "Italy", "Spain", "China", "Brazil", "India", "Russia", "Mexico", "Indonesia", "Turkey", "Netherlands", "Saudi Arabia", "Switzerland", "Sweden", "Poland", "Belgium", "Norway", "Austria", "United Arab Emirates", "Denmark", "Singapore", "Malaysia"];

            const _this = this;

            const svg = d3.select(this.$refs.chart)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            // Load the CSV data
            d3.csv('/COS30045-Project/data/WHO_CANCER_CASE_LINE_BAR.csv').then((csvData) => {
                // Calculate total data for each country, male and female
                csvData.forEach((row) => {
                    const country = row['Country label'] === 'USA' ? 'United States of America' : row['Country label'];
                    const sex = row['Sex'].toLowerCase();

                    if (!_this.countryData[country]) {
                        _this.countryData[country] = {total: 0, male: 0, female: 0};
                    }

                    const total = parseInt(row.Total);
                    _this.countryData[country].total += total;
                    _this.countryData[country][sex] += total;
                });

                // Load GeoJSON data for the world
                d3.json('/COS30045-Project/data/geo.json').then((data) => {
                    if (!data || !data.features) {
                        console.error('Invalid GeoJSON data');
                        return;
                    }

                    const countries = data.features.filter((d) => countryList.includes(d.properties.name));

                    if (countries.length === 0) {
                        console.error('No data found for the selected countries');
                        return;
                    }

                    const projection = d3.geoMercator().fitSize([width, height], {
                        type: 'FeatureCollection',
                        features: countries
                    });
                    const path = d3.geoPath().projection(projection);

                    // Tooltip for displaying data
                    const tooltip = d3.select('body')
                        .append('div')
                        .attr('class', 'tooltip')
                        .style('position', 'absolute')
                        .style('padding', '5px')
                        .style('background', 'rgba(0, 0, 0, 0.7)')
                        .style('color', 'white')
                        .style('border-radius', '5px')
                        .style('visibility', 'hidden');

                    // Draw the countries
                    svg.selectAll('.country')
                        .data(countries)
                        .enter()
                        .append('path')
                        .attr('class', 'country')
                        .attr('d', path)
                        .attr('id', (d) => d.properties.name.toLowerCase().replaceAll(' ', '_'))
                        .style('fill', (d) => _this.colors[_this.theme][d.properties.name.toLowerCase().replaceAll(' ', '_')] ? _this.colors[_this.theme][d.properties.name.toLowerCase().replaceAll(' ', '_')] : 'gray')
                        .on('mouseover', function (event, d) {
                            let validCountry = ["KOR", "JPN", "DEU", "GBR", "USA", "FRA"];
                            if (!validCountry.includes(d.id)) {
                                return;
                            }

                            d3.select(this).style('fill', function (d) {
                                return d3.rgb(d3.select(this).style('fill')).darker(0.9);
                            });

                            /*if (validCountry.includes(d.id)) {
                                d3.select(this).style('fill', function (d) {
                                    return d3.rgb(d3.select(this).style('fill')).darker(0.9);
                                });
                            }*/

                            // Show tooltip with total, male, and female data
                            const countryName = d.properties.name;
                            const countryInfo = _this.countryData[countryName];
                            const tooltipText = `
                                              <strong>${countryName}</strong><br>
                                              Total: ${countryInfo?.total || 'No data'}<br>
                                              Male: ${countryInfo?.male || 'No data'}<br>
                                              Female: ${countryInfo?.female || 'No data'}
                                            `;

                            tooltip
                                .style('visibility', 'visible')
                                .html(tooltipText);
                        })
                        .on('mousemove', (event) => {
                            tooltip
                                .style('top', event.pageY + 10 + 'px')
                                .style('left', event.pageX + 10 + 'px');
                        })
                        .on('mouseout', function (event, d) {
                            const color = _this.colors[_this.theme][d.properties.name.toLowerCase().replaceAll(' ', '_')];
                            d3.select(this).style('fill', (d) => _this.colors[_this.theme][d.properties.name.toLowerCase().replaceAll(' ', '_')] ? _this.colors[_this.theme][d.properties.name.toLowerCase().replaceAll(' ', '_')] : 'gray')
                            tooltip.style('visibility', 'hidden');
                        });

                    // Draw the legend after the map is complete
                    _this.drawLegend();
                }).catch((error) => {
                    alert('Error loading the GeoJSON data: ' + error);
                });
            }).catch((error) => {
                alert('Error loading the CSV data: ' + error);
            });
        },
        updateChartColor() {
            const _this = this;

            let theme = localStorage.getItem('theme') || 'light';
            this.theme = theme;
            d3.selectAll('.country').style('fill', (d) => {
                return _this.colors[_this.theme][d.properties.name.toLowerCase().replaceAll(' ', '_')] ? _this.colors[_this.theme][d.properties.name.toLowerCase().replaceAll(' ', '_')] : 'gray';
            });

            // Update legend colors when theme changes
            this.drawLegend();
        }
    }
};
</script>

<style>
.tooltip {
    position: absolute;
    pointer-events: none;
    opacity: 0.8;
}
</style>