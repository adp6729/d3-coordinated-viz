// main.js
// author: Andrew Pittman

// Corruption and Governance map of Africa
const container = d3.select(".map-container")

const tooltip = d3.select(".map-container .map-tooltip")

const width = parseInt(container.style("width"))
const height = width/0.8

const projection = d3.geoMercator() // projection used for the mercator projection
   .scale(width/1.5)
   .translate([width / 4, height / 1.9])

const pathGenerator = d3.geoPath()
   .projection(projection)

var svg = d3.select(".map-container").append("svg")
    .attr("width", width)
    .attr("height", height)

const countriesG = svg.append('g')
    .attr('class', 'countries')
 
const colorScale = d3.scaleLinear()
    .range(['red', 'pink'])
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
    window.colorScale = colorScale // globalize colorScale
    return africaArray
}

function createMap(africaArray) {
    countriesG
       .selectAll('path')
       .data(africaArray)
       .enter()
          .append('path')
             .attr('class', d => 'country ' + d.properties.SOV_A3)
             .attr('d', d => pathGenerator(d))
             .style('fill', d => {
                if (d.properties.CorruptionPerceptionIndex2015) { // modify
                   return colorScale(d.properties.CorruptionPerceptionIndex2015) // modify
                }
             })
             .on("mousemove", moveToolTip)
             .on("mouseout", hideToolTip)
 }

 function moveToolTip(d) {
    d3.select(this).style('stroke', '5px')
    console.log(d.properties.CorruptionPerceptionIndex2015)
    if (d.properties.CorruptionPerceptionIndex2015) {  // modify
       tooltip.style('opacity', 0.7)
       console.log(d3.mouse(this))
       tooltip.style('left', d3.mouse(this)[0] + 'px')
       tooltip.style('top', d3.mouse(this)[1] + 'px')
       console.log(d.properties.CorruptionPerceptionIndex2015 * 100)
       tooltip.html(`
          <p>${d.properties.ADMIN}</p>&nbsp;<p class="number">${100*d.properties.CorruptionPerceptionIndex2015}%</p>
       `) // modify above
    }
 }
 
 function hideToolTip(d) {
    tooltip.style('opacity', 0)
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