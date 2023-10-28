import * as tooltip from "./tooltip.js"
// (async () => {
//     if (true) {
//         // import module for side effects
//         await import("tooltip");
//     }
// })();




const dataFilePath = 'data/';
let dataFileName = '';

document.addEventListener('DOMContentLoaded', function () {

    const auswahlElement = document.querySelector('#wahldaten');
    auswahlElement.addEventListener('change', CheckAuswahl);

    function CheckAuswahl() {
        dataFileName = auswahlElement.options[auswahlElement.selectedIndex].value;
        redrawDiagram();
    }

});

function redrawDiagram() {

    // svg rahmen

    const svg = d3.select("#diagram"),
        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    svg.selectAll("*").remove();

    const xScale = d3.scaleBand().range([0, width]).padding(0.2),
        yScale = d3.scaleLinear().range([height, 0]);

    const g = svg.append("g")
        .attr("transform", "translate(" + 100 + "," + 100 + ")");


    d3.json(dataFilePath + dataFileName, function (error, data) {
        if (error) {
            // Statischer Text
            d3.select("#titel").text("");
            d3.select("#untertitel").text("");
            d3.select("#quelle").html("");

            throw error;
        }

        // Statischer Text
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


        // Metadaten
        const gesamtstimmen = data.stimmengesamt;
        const stimmengueltig = data.stimmengueltig;
        const minProzentAnzeige = data.minProzentAnzeige;
        const maxProzentAnzeige = data.maxProzentAnzeige;
        const tickAnzahl = (maxProzentAnzeige - minProzentAnzeige) / 5;
        const colors = data.colors;

        // Diagramm Logik
        const xdomain = data.stimmen.map(function (d) {
            return d.name;
        });

        xScale.domain(xdomain);
        yScale.domain([minProzentAnzeige, maxProzentAnzeige]);

        // X-Achse
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

        // Y-Achse
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

        const infoOrgMouseMove = function (d) {
            tooltip.mousemove(d, () => "Anteil bezogen nur auf alle gültigen Wählerstimmen (offizielle Berechnung) ist:<br>" + d.name + ": " + (d.stimmen * 100 / stimmengueltig).toFixed(1) + " %.")
        }

        const infoAltMouseMove = function (d) {
            tooltip.mousemove(d, () => "Anteil bezogen auf alle potentiellen Wählerstimmen (alternative Berechnung) ist:<br>" + d.name + ": " + (d.stimmen * 100 / gesamtstimmen).toFixed(1) + " %.")
        }


        // Alternative Werte
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
            .on("mouseover", tooltip.mouseover)
            .on("mousemove", infoAltMouseMove)
            .on("mouseleave", tooltip.mouseleave)
        ;



        // Offizielle Werte
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
            .on("mouseover", tooltip.mouseover)
            .on("mousemove", infoOrgMouseMove)
            .on("mouseleave", tooltip.mouseleave)
        ;

    });

}