
//
// Tooltip bei Mouseover
//

// Tootip div mit ID=tooltip anlegen
d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('style', 'position: absolute; opacity: 0;')
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
;

const mouseover = function (d) {
    d3.select('#tooltip').transition().duration(200).style('opacity', 1);
}

const mouseleave = function (d) {
    d3.select('#tooltip').style('opacity', 0)
}

const mousemove = function (d, getTextCallback) {
    d3.select('#tooltip')
        .html(getTextCallback())
        .style('left', (d3.event.pageX-100) + 'px')
        .style('top', (d3.event.pageY+30) + 'px')
}


const mousemoveAlt = function (d) {
    d3.select('#tooltip')
        .html("Anteil bezogen auf alle potentiellen Wählerstimmen (alternative Berechnung) ist:<br>" + d.name + ": " + (d.stimmen * 100 / gesamtstimmen).toFixed(1) + " %.")
        .style('left', (d3.event.pageX-100) + 'px')
        .style('top', (d3.event.pageY+30) + 'px')
}

const mousemoveOrg = function (d) {
    d3.select('#tooltip')
        .html("Anteil bezogen nur auf alle gültigen Wählerstimmen (offizielle Berechnung) ist:<br>" + d.name + ": " + (d.stimmen * 100 / stimmengueltig).toFixed(1) + " %.")
        .style('left', (d3.event.pageX+10) + 'px')
        .style('top', (d3.event.pageY+10) + 'px')
}