<template>
    <button id="update-data">Update Data</button>
    <div ref="chart"></div>
</template>

<script>
import * as d3 from 'd3';
import eventBus from '@/eventBus';

export default{
    mounted() {
        this.drawChart();
        document.title = 'Test Chart';
        eventBus.on('themeChanged', this.updateChartColor);
    },
    beforeUnmount() {
        eventBus.off('themeChanged', this.updateChartColor);
    },
    methods: {
        drawChart(){
            var dataset = [24,10,29,19,8,15,20,12,9,6,21,28];
            var numValues = dataset.length;

            // Chart dimensions and padding
            const margin = {top: 50, right: 20, bottom: 50, left: 50};
            var w = 500 - margin.left - margin.right;
            var h = 300 - margin.top - margin.bottom;

            // Define the xScale and yScale
            var xScale = d3.scaleBand()
                .domain(d3.range(dataset.length))
                .range([0, w])
                .paddingInner(0.05);

            var yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset)])
                .range([h, 0]);

            // Create the SVG element
            var svg = d3.select(this.$refs.chart)
                .append("svg")
                .attr("width", w + margin.left + margin.right)
                .attr("height", h + margin.top + margin.bottom)

            let theme = localStorage.getItem('theme') || 'light';
            let color = theme === 'dark' ? 'white' : 'black';

            // Create the initial bars
            svg.selectAll("rect")
                .data(dataset)
                .enter()
                .append("rect")
                .attr("x", function(d, i) {
                    return xScale(i) + 20;
                })
                .attr("y", function(d) {
                    return yScale(d);
                })
                .attr("width", xScale.bandwidth())
                .attr("height", function(d) {
                    return h - yScale(d);
                })
                .attr("fill", color);

            // X Axis
            var xAxis = d3.axisBottom(xScale)
                .ticks(dataset.length);

            svg.selectAll("text")
                .data(dataset)
                .enter()
                .append("text")
                .attr("x", function (d, i) {
                    return xScale(i) + xScale.bandwidth() / 3 + 20;
                })
                .attr("y", function (d) {
                    return yScale(d) + 15;
                })
                .attr("class", "label")
                .attr("font-size", "12px")
                .attr("fill", color === 'black' ? 'white' : 'black')
                .text(function (d) {
                    return d;
                })

            // Append the X axis
            svg.append("g")
                .attr("transform", "translate(20," + h + ")") // Position it at the bottom
                .attr("fill", color)
                .call(xAxis);

            var yAxis = d3.axisLeft(yScale);

            // Append the Y axis
            svg.append("g")
                .attr("transform", "translate(" + 20 + ",0)")
                .attr("fill", color)
                .call(yAxis);


            // Button click event to update data
            d3.select("#update-data").on("click", function() {
                // Generate new random dataset
                dataset = [];
                for (var i = 0; i < numValues; i++) {
                    var newNumber = Math.floor(Math.random() * 25);
                    dataset.push(newNumber);
                }

                // Update xScale to reflect new dataset
                xScale.domain(d3.range(dataset.length));

                // Update yScale to reflect new dataset
                yScale.domain([0, d3.max(dataset)]);

                svg.selectAll("rect")
                    .data(dataset)
                    .attr("y", function (d) {
                        return yScale(d);
                    })
                    .attr("height", function (d) {
                        return h - yScale(d);
                    });

                svg.selectAll("text")
                    .data(dataset)
                    .text(function (d) {
                        return d;
                    })
                    .attr("class", "label")
                    .attr("x", function (d, i) {
                        return xScale(i) + xScale.bandwidth() / 3 + 20;
                    })
                    .attr("y", function (d) {
                        return yScale(d) + 15;
                    })
            });
        },
        updateChartColor() {
            let theme = localStorage.getItem('theme') || 'light';
            let color = theme === 'dark' ? 'white' : 'black';

            const svg = d3.select(this.$refs.chart).select('svg');

            svg.selectAll('rect')
                .transition()
                .duration(200)
                .attr('fill', color);

            svg.selectAll('text')
                .transition()
                .duration(200)
                .attr('fill', color);

            svg.selectAll('.label')
                .transition()
                .duration(200)
                .attr('fill', color === 'black' ? 'white' : 'black');
        }
    }
}
</script>

<style>

</style>