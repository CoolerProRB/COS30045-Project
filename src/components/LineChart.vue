<template>
    <div class="mx-auto my-5 w-11/12 flex justify-center">
        <div ref="chart" class="bg-gray-100 dark:bg-gray-700 cursor-pointer"></div>
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
            // set the dimensions and margins of the graph
            var margin = {top: 10, right: 30, bottom: 30, left: 60},
                width = $(".w-11\\/12").width() - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            var svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            //Read the data
            d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",

                // When reading the csv, I must format variables:
                function(d){
                    return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
                }).then(

                // Now I can use this dataset:
                function(data) {

                    // Add X axis --> it is a date format
                    const x = d3.scaleTime()
                        .domain(d3.extent(data, function(d) { return d.date; }))
                        .range([ 0, width ]);
                    svg.append("g")
                        .attr("transform", `translate(0, ${height})`)
                        .call(d3.axisBottom(x));

                    // Add Y axis
                    const y = d3.scaleLinear()
                        .domain([0, d3.max(data, function(d) { return +d.value; })])
                        .range([ height, 0 ]);
                    svg.append("g")
                        .call(d3.axisLeft(y));

                    // Add the line
                    svg.append("path")
                        .datum(data)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 1.5)
                        .attr("d", d3.line()
                            .x(function(d) { return x(d.date) })
                            .y(function(d) { return y(d.value) })
                        )

                })
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