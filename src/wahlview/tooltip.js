
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

export function mouseover () {
    d3.select('#tooltip').transition().duration(200).style('opacity', 1);
}

export function mouseleave() {
    d3.select('#tooltip').style('opacity', 0)
}

export function mousemove(d, getTextCallback) {
    d3.select('#tooltip')
        .html(getTextCallback())
        .style('left', (d3.event.pageX-100) + 'px')
        .style('top', (d3.event.pageY+30) + 'px')
}
