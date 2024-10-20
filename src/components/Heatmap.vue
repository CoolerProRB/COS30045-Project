<template>
    <div class="mx-auto my-5 w-11/12 flex justify-center">
        <div ref="chart" id="chart" class="bg-gray-100 dark:bg-gray-700"></div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import eventBus from '@/eventBus';
import $ from 'jquery';

export default {
    mounted() {
        this.drawChart();
        document.title = 'Heatmap';
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
    },
    methods: {
        drawChart(){
            // set the dimensions and margins of the graph
            const margin = {top: 30, right: 25, bottom: 30, left: 40},
                width = $(".w-11\\/12").width() - margin.left - margin.right,
                height = 450 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            const svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            //Read the data
            d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv").then(function(data) {

                // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
                const myGroups = Array.from(new Set(data.map(d => d.group)))
                const myVars = Array.from(new Set(data.map(d => d.variable)))

                // Build X scales and axis:
                const x = d3.scaleBand()
                    .range([ 0, width ])
                    .domain(myGroups)
                    .padding(0.05);
                svg.append("g")
                    .style("font-size", 15)
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x).tickSize(0))
                    .select(".domain").remove()

                // Build Y scales and axis:
                const y = d3.scaleBand()
                    .range([ height, 0 ])
                    .domain(myVars)
                    .padding(0.05);
                svg.append("g")
                    .style("font-size", 15)
                    .call(d3.axisLeft(y).tickSize(0))
                    .select(".domain").remove()

                // Build color scale
                const myColor = d3.scaleSequential(d3.interpolateBlues)
                    .domain([1,100])

                // create a tooltip
                const tooltip = d3.select("#chart")
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "tooltip")
                    .style("background-color", "white")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("padding", "5px")
                    .style("color", "black")
                    .style("position", "absolute")

                // Three function that change the tooltip when user hover / move / leave a cell
                const mouseover = function(event,d) {
                    tooltip.style("opacity", 1)
                    d3.select(this)
                        .style("stroke", "black")
                        .style("opacity", 1)
                }
                const mousemove = function(event,d) {
                    tooltip
                        .html("The exact value of<br>this cell is: " + d.value)
                        .style("left", (event.x) + 10 + "px")
                        .style("top", (event.y) + 10 + "px")
                }
                const mouseleave = function(event,d) {
                    tooltip
                        .style("opacity", 0)
                    d3.select(this)
                        .style("stroke", "none")
                        .style("opacity", 0.8)
                }

                // add the squares
                svg.selectAll()
                    .data(data, function(d) {return d.group+':'+d.variable;})
                    .join("rect")
                    .attr("x", function(d) { return x(d.group) })
                    .attr("y", function(d) { return y(d.variable) })
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("width", x.bandwidth() )
                    .attr("height", y.bandwidth() )
                    .style("fill", function(d) { return myColor(d.value)} )
                    .style("stroke-width", 4)
                    .style("stroke", "none")
                    .style("opacity", 0.8)
                    .style("cursor", "pointer")
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
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