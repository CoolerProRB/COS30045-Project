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
            <p class="font-bold">Worldwide Respiratory Cancer Incidence Globe (2000-2012)</p>
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
                    germany: '#ffd92f',
                    bermuda: 'rgba(47,59,134,0.65)'
                },
                dark: {
                    france: '#ff7f0e',
                    united_states_of_america: '#1f77b4',
                    united_kingdom: '#9467bd',
                    south_korea: '#d62728',
                    japan: '#2ca02c',
                    germany: '#ffbb78',
                    bermuda: 'rgba(47,59,134,0.65)'
                }
            },
            countryData: {},
            rotation: [0, 0, 0],
            dragging: false,
            lastX: 0,
            lastY: 0
        };
    },
    mounted() {
        this.drawChart();
        document.title = 'Globe Chart';
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
        d3.select(this.$refs.legend).selectAll('*').remove();
        if (this.interval) clearInterval(this.interval);
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

            legendItems.append('rect')
                .attr('x', 5)
                .attr('y', 5)
                .attr('width', 20)
                .attr('height', 20)
                .style('fill', (d) => this.colors[this.theme][d.toLowerCase().replaceAll(' ', '_')]);

            legendItems.append('text')
                .attr('x', 30)
                .attr('y', 20)
                .text(d => {
                    if (d === 'United States of America') return 'USA';
                    else if (d === 'United Kingdom') return 'UK';
                    else if (d === 'South Korea') return 'Korea';
                    return d;
                })
                .style('font-size', '12px')
                .attr('fill', () => this.theme === 'dark' ? 'white' : 'black');
        },
        drawChart() {
            const width = $('.w-9\\/12').width();
            const height = width * 0.8;
            const sensitivity = 20;

            // Clear existing content
            d3.select(this.$refs.chart).selectAll('*').remove();

            const svg = d3.select(this.$refs.chart)
                .append('svg')
                .attr('width', width)
                .attr('height', height);


            const projection = d3.geoOrthographic()
                .scale(Math.min(width, height) / 2.5)
                .center([0, 0])
                .translate([width / 2, height / 2]);

            const path = d3.geoPath().projection(projection);

            // Create a tooltip
            const tooltip = d3.select('body')
                .append('div')
                .attr('class', 'tooltip')
                .style('position', 'absolute')
                .style('padding', '5px')
                .style('background', 'rgba(0, 0, 0, 0.7)')
                .style('color', 'white')
                .style('border-radius', '5px')
                .style('visibility', 'hidden');

            const _this = this;
            const countryList = [
                "Afghanistan", "Angola", "Albania", "United Arab Emirates", "Argentina",
                "Armenia", "Antarctica", "French Southern and Antarctic Lands", "Australia",
                "Austria", "Azerbaijan", "Burundi", "Belgium", "Benin", "Burkina Faso",
                "Bangladesh", "Bermuda", "Bulgaria", "The Bahamas", "Bosnia and Herzegovina", "Belarus",
                "Belize", "Bolivia", "Brazil", "Brunei", "Bhutan", "Botswana",
                "Central African Republic", "Canada", "Switzerland", "Chile", "China",
                "Ivory Coast", "Cameroon", "Democratic Republic of the Congo",
                "Republic of the Congo", "Colombia", "Costa Rica", "Cuba", "Northern Cyprus",
                "Cyprus", "Czech Republic", "Germany", "Djibouti", "Denmark",
                "Dominican Republic", "Algeria", "Ecuador", "Egypt", "Eritrea", "Spain",
                "Estonia", "Ethiopia", "Finland", "Fiji", "Falkland Islands", "France",
                "Gabon", "United Kingdom", "Georgia", "Ghana", "Guinea", "Gambia",
                "Guinea Bissau", "Equatorial Guinea", "Greece", "Greenland", "Guatemala",
                "French Guiana", "Guyana", "Honduras", "Croatia", "Haiti", "Hungary",
                "Indonesia", "India", "Ireland", "Iran", "Iraq", "Iceland", "Israel",
                "Italy", "Jamaica", "Jordan", "Japan", "Kazakhstan", "Kenya", "Kyrgyzstan",
                "Cambodia", "South Korea", "Kosovo", "Kuwait", "Laos", "Lebanon", "Liberia",
                "Libya", "Sri Lanka", "Lesotho", "Lithuania", "Luxembourg", "Latvia",
                "Morocco", "Moldova", "Madagascar", "Mexico", "Macedonia", "Mali", "Malta",
                "Myanmar", "Montenegro", "Mongolia", "Mozambique", "Mauritania", "Malawi",
                "Malaysia", "Namibia", "New Caledonia", "Niger", "Nigeria", "Nicaragua",
                "Netherlands", "Norway", "Nepal", "New Zealand", "Oman", "Pakistan",
                "Panama", "Peru", "Philippines", "Papua New Guinea", "Poland", "Puerto Rico",
                "North Korea", "Portugal", "Paraguay", "Qatar", "Romania", "Russia",
                "Rwanda", "Western Sahara", "Saudi Arabia", "Sudan", "South Sudan",
                "Senegal", "Solomon Islands", "Sierra Leone", "Singapore", "El Salvador",
                "Somaliland", "Somalia", "Republic of Serbia", "Suriname", "Slovakia",
                "Slovenia", "Sweden", "Swaziland", "Syria", "Chad", "Togo", "Thailand",
                "Tajikistan", "Turkmenistan", "East Timor", "Trinidad and Tobago",
                "Tunisia", "Turkey", "Taiwan", "United Republic of Tanzania", "Uganda",
                "Ukraine", "Uruguay", "United States of America", "Uzbekistan", "Venezuela",
                "Vietnam", "Vanuatu", "West Bank", "Yemen", "South Africa", "Zambia",
                "Zimbabwe"
            ];

            // Load data
            Promise.all([
                d3.csv('/COS30045-Project/data/WHO_CANCER_CASE_LINE_BAR.csv'),
                d3.json('/COS30045-Project/data/geo.json')
            ]).then(([csvData, worldData]) => {
                // Process CSV data
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

                // Draw countries
                const countries = worldData.features.filter((d) => countryList.includes(d.properties.name));

                const globe = svg.selectAll('.country')
                    .data(countries)
                    .enter()
                    .append('path')
                    .attr('class', 'country')
                    .attr('d', path)
                    .attr('id', (d) => d.properties.name.toLowerCase().replaceAll(' ', '_'))
                    .style('fill', (d) => _this.colors[_this.theme][d.properties.name.toLowerCase().replaceAll(' ', '_')] || 'gray')
                    .style('stroke', _this.theme === 'dark' ? '#444' : '#fff')
                    .style('stroke-width', '0.5px')
                    .on('mouseover', function(event, d) {
                        let validCountry = ["KOR", "JPN", "DEU", "GBR", "USA", "FRA"];
                        if (!validCountry.includes(d.id)) return;

                        d3.select(this).style('fill', function(d) {
                            return d3.rgb(d3.select(this).style('fill')).darker(0.9);
                        });

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
                    .on('mouseout', function(event, d) {
                        d3.select(this).style('fill', (d) =>
                            _this.colors[_this.theme][d.properties.name.toLowerCase().replaceAll(' ', '_')] || 'gray'
                        );
                        tooltip.style('visibility', 'hidden');
                    });

                // Add rotation interaction
                svg.call(d3.drag()
                    .on('start', () => {
                        _this.dragging = true;
                        if (_this.interval) clearInterval(_this.interval);
                    })
                    .on('drag', (event) => {
                        const rotate = projection.rotate();
                        projection.rotate([
                            rotate[0] + event.dx / sensitivity,
                            rotate[1] - event.dy / sensitivity
                        ]);
                        svg.selectAll('path').attr('d', path);
                    })
                    .on('end', () => {
                        _this.dragging = false;
                        _this.startRotation(projection, svg, path);
                    }));

                // Start automatic rotation
                this.startRotation(projection, svg, path);

                // Draw the legend
                _this.drawLegend();
            }).catch(error => {
                console.error('Error loading data:', error);
            });
        },
        startRotation(projection, svg, path) {
            if (this.interval) clearInterval(this.interval);

            this.interval = setInterval(() => {
                if (!this.dragging) {
                    const rotate = projection.rotate();
                    projection.rotate([rotate[0] + 0.2, rotate[1]]);
                    svg.selectAll('path').attr('d', path);
                }
            }, 50);
        },
        updateChartColor() {
            this.theme = localStorage.getItem('theme') || 'light';
            this.drawChart();
        }
    }
};
</script>

<style>
.tooltip {
    position: absolute;
    pointer-events: none;
    opacity: 0.8;
    z-index: 1000;
}

.ocean {
    transition: fill 0.3s ease;
}

.country {
    transition: fill 0.3s ease;
}
</style>