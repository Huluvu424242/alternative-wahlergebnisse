var dataFilePath = 'data/deutschland/bayern/2023/';
var dataFileName = '';

document.addEventListener('DOMContentLoaded', function () {

    var auswahlElement = document.querySelector('#wahldaten');
    auswahlElement.addEventListener('change', CheckAuswahl);

    function CheckAuswahl() {
        dataFileName = auswahlElement.options[auswahlElement.selectedIndex].value;
        redrawDiagram();
    }

});

function redrawDiagram() {

    <!-- svg rahmen -->

    var svg = d3.select("#diagram"),
        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    svg.selectAll("*").remove();

    var xScale = d3.scaleBand().range([0, width]).padding(0.2),
        yScale = d3.scaleLinear().range([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + 100 + "," + 100 + ")");


    d3.json(dataFilePath + dataFileName, function (error, data) {
        if (error) {
            <!-- Statischer Text-->
            d3.select("#titel").text("");
            d3.select("#untertitel").text("");
            d3.select("#quelle").html("");

            throw error;
        }

        <!-- Statischer Text-->
        d3.select("#titel").text(data.titel);
        d3.select("#untertitel").text(data.untertitel);
        d3.select("#quelle").html("Datenquelle: " +
            "<a href=\"" + data.datenquelle.url + "\" target=\"_blank\" rel=\"noopener noreferrer\">" +
            data.datenquelle.name + "</a>" +
            "<span class=\"CssComponent__CssInlineComponent-sc-1oskqb9-1 Icon___StyledCssInlineComponent-sc-11tmcw7-0  czJJEw\">" +
            "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">" +
            "<title>Link zu externen Inhalten</title>" +
            "<path d=\"M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9\" class=\"icon_svg-stroke\" stroke=\"#666\" " +
            "stroke-width=\"1.5\" fill=\"none\" fill-rule=\"evenodd\" " +
            "stroke-linecap=\"round\" stroke-linejoin=\"round\">" +
            "</path></svg></span>"
        );


        <!-- Metadaten -->
        var gesamtstimmen = data.stimmengesamt;
        var stimmengueltig = data.stimmengueltig;
        var minProzentAnzeige = data.minProzentAnzeige;
        var maxProzentAnzeige = data.maxProzentAnzeige;
        var tickAnzahl = (maxProzentAnzeige - minProzentAnzeige) / 5;
        var colors = data.colors;


        <!-- Lengende bei Mouse Over -->
        var Tooltip = d3.select("#tooltip")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        var mouseover = function (d) {
            Tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }

        var mouseleave = function (d) {
            Tooltip
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }

        var mousemoveAlt = function (d) {
            Tooltip
                .html("Anteil bezogen auf alle potentiellen Wählerstimmen (alternative Berechnung) ist:<br>" + d.name + ": " + (d.stimmen * 100 / gesamtstimmen).toFixed(1) + " %.")
                .style("left", (d3.mouse(this)[0] + 70) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")
        }

        var mousemoveOrg = function (d) {
            Tooltip
                .html("Anteil bezogen nur auf alle gültigen Wählerstimmen (offizielle Berechnung) ist:<br>" + d.name + ": " + (d.stimmen * 100 / stimmengueltig).toFixed(1) + " %.")
                .style("left", (d3.mouse(this)[0] + 70) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")
        }

        <!-- Diagramm Logik -->

        var xdomain = data.stimmen.map(function (d) {
            console.log(d);
            return d.name;
        });

        xScale.domain(xdomain);
        yScale.domain([minProzentAnzeige, maxProzentAnzeige]);

        <!-- X-Achse -->
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).tickFormat(function (d) {
                return '' + d;
            }))
            .append("text")
            .attr("x", 600 / 2)
            .attr("dx", "-5.1em")
            .attr("y", 6)
            .attr("dy", "5.1em")
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Parteien zur Wahl");

        <!-- Y-Achse -->
        g.append("g")
            .call(d3.axisLeft(yScale).tickFormat(function (d) {
                return d + ' %';
            }).ticks(tickAnzahl))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-5.1em")
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Stimmen in Prozent");

        <!-- Alternative Werte -->
        g.selectAll(".bar")
            .data(data.stimmen)
            .enter().append("rect")
            .attr("class", "bar")
            .style('fill', d => colors[d.name].alt)
            .attr("x", function (d) {
                return xScale(d.name);
            })
            .attr("y", function (d) {
                return yScale(d.stimmen * 100 / gesamtstimmen);
            })
            .attr("width", xScale.bandwidth() / 2)
            .attr("height", function (d) {
                return height - yScale(d.stimmen * 100 / gesamtstimmen);
            })
            .on("mouseover", mouseover)
            .on("mousemove", mousemoveAlt)
            .on("mouseleave", mouseleave)
        ;


        <!-- Offizielle Werte -->
        g.selectAll(".barorg")
            .data(data.stimmen)
            .enter().append("rect")
            .attr("class", "barorg")
            .style('fill', d => colors[d.name].org)
            .attr("x", function (d) {
                return xScale(d.name) + 25;
            })
            .attr("y", function (d) {
                return yScale(d.stimmen * 100 / stimmengueltig);
            })
            .attr("width", xScale.bandwidth() / 2)
            .attr("height", function (d) {
                return height - yScale(d.stimmen * 100 / stimmengueltig);
            })
            .on("mouseover", mouseover)
            .on("mousemove", mousemoveOrg)
            .on("mouseleave", mouseleave)
        ;

        <!-- add legend -->
        var xOffset = 10;
        var yOffset = 100;
        var legendItemSize = 12;
        var legendSpacing = 4;

        var legend = d3.select("#legend");

        legend
            .enter()
            .append('rect')
            .attr('class', 'legendItem')
            .attr('width', legendItemSize)
            .attr('height', legendItemSize)
            .style('fill', d => d.color)
            .attr('transform',
                (d, i) => {
                    var x = xOffset;
                    var y = yOffset + (legendItemSize + legendSpacing) * i;
                    return `translate(${x}, ${y})`;
                });

        legend
            .enter()
            .append('text')
            .attr('x', xOffset + legendItemSize + 5)
            .attr('y', (d, i) => yOffset + (legendItemSize + legendSpacing) * i + 12)
            .text(d => d.name);

    });

}