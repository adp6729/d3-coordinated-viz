// main.js
// author: Andrew Pittman

// Corruption and Governance map of Africa
const body = d3.select("body")
const container = d3.select(".map-container")
const chart = d3.select(".bar-chart")

const tooltip = d3.select(".map-container .map-tooltip")

const width = parseInt(container.style("width"))
const height = width/0.88

const projection = d3.geoMercator() // projection used for the mercator projection
    .center([17, 1])
    .scale(width/1.3)
    .translate([width / 2, height / 2])

const pathGenerator = d3.geoPath()
    .projection(projection)

var svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)

const countriesG = svg.append('g')
    .attr('class', 'countries')

// Handle data initialization
const attributes = [ {"indicator": "CorruptionPerceptionIndex2015",
                        "name": "Corruption Perception",
                        "format": ".0%",
                        "domainData": [0, 1], 
                        "domainBar": [0, 100]}, 
                    {"indicator": "CorruptionControl2015", 
                        "name": "Corruption Control",
                        "format": ".0%", 
                        "domainData": [0, 1],
                        "domainBar": [0, 100]},
                    {"indicator": "IbrahimIndex2015", 
                        "name": "Ibrahim Index",
                        "format": ".0f", 
                        "domainData": [55, 0],
                        "domainBar": [0, 55]}, 
                    {"indicator": "EaseOfDoingBusinessRank2015", 
                        "name": "Ease of Doing Business",
                        "format": ".0f", 
                        "domainData": [250, 0],
                        "domainBar": [0, 250]}, 
                    {"indicator": "NAIPerAdultDollars2017", 
                        "name": "National Average Income Per Adult",
                        "format": "$,.2f", 
                        "domainData": [0, 35000],
                        "domainBar": [0, 35000]}, 
                    {"indicator": "GDPPerAdultDollars2017", 
                        "name": "Gross Domestic Product Per Adult",
                        "format": "$,.2f", 
                        "domainData": [0, 45000],
                        "domainBar": [0, 45000]}
                    ]

const attributeMap = d3.map(attributes, d => d.indicator)
        


// // Create Graticule
// const graticuleG = svg.append('g')
//     .attr('class', 'graticule')

// const graticule = d3.geoGraticule()
//     .step([12, 12])
   
// var gratLines = graticuleG.selectAll(".gratLines")
//     .data(graticule.lines())
//     .enter()
//         .append("path")
//             .attr("class", "gratLines")
//             .attr("d", pathGenerator)

// var gratBackground = graticuleG.append("path")
//     .datum(graticule.outline())
//     .attr("class", "gratBackground")
//     .attr("d", pathGenerator)

// gratLines.exit().remove()
 
const colorScale = d3.scaleLinear()
    .range(['black', 'red'])

Promise.all([
    d3.json('data/worldMap50mSimplified.json', function(error, world) {
        if (error) return console.error(error)}),
    d3.csv('data/africaCorruptionData.csv', d => { 
       d.CorruptionPerceptionIndex2015 = +d.CorruptionPerceptionIndex2015
       d.CorruptionControl2015 = +d.CorruptionControl2015
       d.IbrahimIndex2015 = +d.IbrahimIndex2015
       d.EaseOfDoingBusinessRank2015 = +d.EaseOfDoingBusinessRank2015
       d.NAIPerAdultDollars2017 = +d.NAIPerAdultDollars2017
       d.GDPPerAdultDollars2017 = +d.GDPPerAdultDollars2017
       return d
    })]
)
    .then(processData)
    .then(createMap)
    .then(createChart)

function processData(results) {
    const geoJson = topojson.feature(results[0],results[0].objects.ne_50m_admin_0_countries_lakes)
    const cData = results[1]
    var africaArray = []
    for (const feature of geoJson.features) {
        if (feature.properties.CONTINENT == "Africa" || feature.properties.ISO_A2 == ('SC' || 'MU')) {
            for (const stat of cData) {
                if (feature.properties.ISO_A2 == stat.ISO2) {
                    feature.properties.CorruptionPerceptionIndex2015 = stat.CorruptionPerceptionIndex2015
                    feature.properties.CorruptionControl2015 = stat.CorruptionControl2015
                    feature.properties.IbrahimIndex2015 = stat.IbrahimIndex2015
                    feature.properties.EaseOfDoingBusinessRank2015 = stat.EaseOfDoingBusinessRank2015
                    feature.properties.NAIPerAdultDollars2017 = stat.NAIPerAdultDollars2017
                    feature.properties.GDPPerAdultDollars2017 = stat.GDPPerAdultDollars2017             
                    break
                }
            }
            africaArray.push(feature)
        }
    }
    colorScale.domain(d3.extent(cData, d=>d.CorruptionPerceptionIndex2015))
    window.cData = cData // globalize
    window.africaArray = africaArray // globalize
    return africaArray
}

function createMap(africaArray) {
    countriesG
       .selectAll('path')
       .data(africaArray)
       .enter()
          .append('path')
             .attr('class', d => 'country ' + d.properties.ISO_A2)
             .attr('d', pathGenerator)
             .style('fill', d => {
                if (d.properties.CorruptionPerceptionIndex2015) { // modify
                   return colorScale(d.properties.CorruptionPerceptionIndex2015) // modify
                }
             })
             .on("mousemove", moveToolTip)
             .on("mouseout", hideToolTip)
    
    return africaArray
 }

 function moveToolTip(d) {
    if (d.properties.CorruptionPerceptionIndex2015) {  // modify
       tooltip.style('opacity', 0.8)
       tooltip.style('left', d3.mouse(this)[0] + 20 + 'px')
       tooltip.style('top', d3.mouse(this)[1] + 20 + 'px')
       const cPFormat = d3.format(".0%")
       tooltip.html(`
          <p>${d.properties.ADMIN}<span class="number"> ${cPFormat(d.properties.CorruptionPerceptionIndex2015)}</span></p>          
       `) // modify above
       
       d3.select(this)
          .style('stroke', '#343a40')
          .style('stroke-width', '2.5')
          .raise()
    }
 }
 
 function hideToolTip(d) {
    tooltip.style('opacity', 0)
    d3.select(this)
          .style('stroke', 'white')
          .style('stroke-width', '1')
 }

//  bar chart

const chartWidth = parseInt(chart.style("width"))
const chartHeight = width/0.92

const barScale = d3.scaleLinear()
    .range([0, chartWidth - 40 - 40])
    .domain([0, 100]);
 
var chartSVG = chart.append("svg")
    .attr("width", chartWidth - 40 - 40)
    .attr("height", chartHeight)
    .attr("class", "chart")

const barsG = chartSVG.append("g")
    .attr("class", "bars")

function createChart(africaArray) {
    const filteredAfricaArray = africaArray.filter(d => !isNaN(d.properties.CorruptionPerceptionIndex2015))
    const cPFormat = d3.format(".0%")
    barsG
        .selectAll('path')
        .data(filteredAfricaArray)
        .enter()
            .append('rect')
                .sort((a, b) => (d3.descending(a.properties.CorruptionPerceptionIndex2015, b.properties.CorruptionPerceptionIndex2015)))
                .attr("class", d => 'bar ' + d.properties.ISO_A2)
                .attr("width", d => {
                    var width = 0
                    if (d.properties.CorruptionPerceptionIndex2015) {
                        width = barScale(parseInt(cPFormat(d.properties.CorruptionPerceptionIndex2015)))
                    }
                    return width
                })
                .attr("x", 0)
                .attr("height", chartHeight / filteredAfricaArray.length - 2)
                .attr("y", (d, i) => i * (chartHeight / (filteredAfricaArray.length + 1)))
                .style('fill', d => {
                    if (d.properties.CorruptionPerceptionIndex2015) { // modify
                       return colorScale(d.properties.CorruptionPerceptionIndex2015) // modify
                    }
                 })
    barsG
        .selectAll('text')
        .data(filteredAfricaArray)
        .enter()
            .append('text')
                .sort((a, b) => (d3.descending(a.properties.CorruptionPerceptionIndex2015, b.properties.CorruptionPerceptionIndex2015)))
                .attr("class", d => 'number ' + d.properties.ISO_A2)
                .attr("text-anchor", "right")
                .attr("x", (d, i) => {
                    var x = 0
                    if (d.properties.CorruptionPerceptionIndex2015) {
                        x = barScale(parseInt(cPFormat(d.properties.CorruptionPerceptionIndex2015)))
                    }
                    return x - 38
                })
                .attr("y", (d, i) => {
                    const fraction = chartHeight / (filteredAfricaArray.length + 1)
                    return (i + 0.9) * fraction 
                })
                .text(d => cPFormat(d.properties.CorruptionPerceptionIndex2015))
    
    // const xAxis = d3.axisTop()
    //     .scale(barScale)
    //     .orient("top")

    const axis = chartSVG.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (chartHeight) + ")")
        .call(d3.axisTop(barScale))
}

function rerender(selectionIndicator) {
    const dataString = "d.properties." + selectionIndicator
    const cPFormat = d3.format(attributeMap.get(selectionIndicator).format)
    colorScale.domain(attributeMap.get(selectionIndicator).domainData)

    // Reset indicator text on nav bar
    d3.select("#navbarDropdownMenuLink")
        .text(attributeMap.get(selectionIndicator).name)
    
    // Change map fill and tooltip text upon indicator change
    d3.selectAll(".country")
        .style("fill", d => {
            outColor = "#808080"
            if (eval(dataString)) {
                outColor = colorScale(eval(dataString))
            }
            return outColor
        })
        .on("mousemove", moveToolTip)
        .on("mouseout", hideToolTip)

    function moveToolTip(d) {
        if (eval(dataString)) {
            tooltip.style('opacity', 0.8)
            tooltip.style('left', d3.mouse(this)[0] + 20 + 'px')
            tooltip.style('top', d3.mouse(this)[1] + 20 + 'px')
            tooltip.html(`
                <p>${d.properties.ADMIN}<span class="number"> ${cPFormat(eval(dataString))}</span></p>          
            `)
            
            d3.select(this)
                .style('stroke', '#343a40')
                .style('stroke-width', '2.5')
                .raise()
        }
    }

    function hideToolTip(d) {
        tooltip.style('opacity', 0)
        d3.select(this)
              .style('stroke', 'white')
              .style('stroke-width', '1')
     }
    
    barScale.domain(attributeMap.get(selectionIndicator).domainBar)
    const filteredAfricaArray = africaArray.filter(d => !isNaN(eval(dataString)))
    
    d3.selectAll(".bar")
        .sort((a, b) => {
            if (selectionIndicator.includes('Ibrahim') || selectionIndicator.includes('Business')) {
                return d3.ascending(eval('a.properties.' + selectionIndicator), eval('b.properties.' + selectionIndicator))
            } else {
                return d3.descending(eval('a.properties.' + selectionIndicator), eval('b.properties.' + selectionIndicator))
            }
        })
        .attr("width", d => {
            var width = 0
            if (eval(dataString)) {
                if (attributeMap.get(selectionIndicator).format.includes('%'))  {
                    width = barScale(parseInt(cPFormat(eval(dataString))))
                } else {
                width = barScale(eval(dataString))
                }
            }
            return width
        })
        .attr("x", 0)
        .attr("y", (d, i) => i * (chartHeight / (filteredAfricaArray.length + 1)))
        .style('fill', d => {
            if (eval(dataString)) { 
                console.log(d.properties.ISO_A2, colorScale(eval(dataString)))
                return colorScale(eval(dataString))
            }
        })
    
    d3.select(".axis")
        .call(d3.axisTop(barScale))
        
}

// Lab Module 2-1, All Lessons
// const width = 900, height = 500

// const x = d3.scaleLinear()
//     .range([90, 750])
//     .domain([0, 3])

// const dataArray = [10, 20, 30, 40, 50]

// var cityPop = [
//   { 
//       city: 'Madison',
//       population: 233209
//   },
//   {
//       city: 'Milwaukee',
//       population: 594833
//   },
//   {
//       city: 'Green Bay',
//       population: 104057
//   },
//   {
//       city: 'Superior',
//       population: 27244
//   }
// ]

// const extentPop = d3.extent(cityPop, function(d){
//   return d.population
// })

// const y = d3.scaleLinear()
//     .range([450, 50])
//     // .domain(extentPop)
//     .domain([0, 700000])

// // const yAxis = d3.axisLeft(y)
// //     .scale(y)
// //     .orient("left")

// const colorScale = d3.scaleLinear()
//     .range([
//         "#FDBE85",
//         "#D94701"
//     ])
//     .domain([
//         extentPop[0],
//         extentPop[1],
//     ])

// const container = d3.select("body")
//       .append("svg") 
//         .attr("width", width) 
//         .attr("height", height) 
//         .attr("class", "container")
//         .style("background-color", "rgba(0,0,0,0.2)")
        
// const innerRect = container.append("rect")
//         .datum(400)
//         .attr("width", function(d){
//           return d * 2
//         })
//         .attr("height", function(d){
//           return d
//         })
//         .attr("class", "innerRect")
//         .attr("x", 50) 
//         .attr("y", 50) 
//         .style("fill", "#FFFFFF")

// const circles = container.selectAll(".circles")
//         .data(cityPop)
//         .enter()
//         .append("circle")
//           .attr("class", "circles")
//           .attr("id", function(d){return d.city})
//           .attr("r", function(d, i){ 
//               var area = d.population * 0.01
//               return Math.sqrt(area/Math.PI)
//           })
//           .attr("cx", function(d, i){
//               return x(i)
//           })
//           .attr("cy", function(d){
//               return y(d.population)
//           })
//           .style("fill", function(d, i){
//             return colorScale(d.population)
//           })
//           .style("stroke", "#000")

// const axis = container.append("g")
//         .attr("class", "axis")
//         .attr("transform", "translate(50, 0)")
//         .call(d3.axisLeft(y))

// const title = container.append("text")
//         .attr("class", "title")
//         .attr("text-anchor", "middle")
//         .attr("x", 450)
//         .attr("y", 30)
//         .text("City Populations")

// const labels = container.selectAll(".labels")
//         .data(cityPop)
//         .enter()
//         .append("text")
//           .attr("class", "labels")
//           .attr("text-anchor", "left")
//           .attr("y", function(d){
//               return y(d.population) + 5;
//           })

// const nameLine = labels.append("tspan")
//           .attr("class", "nameLine")
//           .attr("x", function(d,i){
//               return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
//           })
//           .text(function(d){
//               return d.city;
//           })

// const popFormat = d3.format(",")
  
// const popLine = labels.append("tspan")
//           .attr("class", "popLine")
//           .attr("x", function(d,i){
//               return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
//           })
//           .attr("dy", "15")
//           .text(function(d){
//               return "Pop. " + popFormat(d.population);
//           })
