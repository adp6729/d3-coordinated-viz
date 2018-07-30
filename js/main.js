// main.js
// author: Andrew Pittman

// // web map of Africa
// var width = 860,
//     height = 800

// var path = d3.geoPath()
//     .projection(null)

// var svg = d3.select("body").append("svg")
//     .attr("width", width)
//     .attr("height", height)

// d3.json("data/africa.json", function(error, africa) {
//   if (error) throw error

//   svg.append("g")
//       .attr("class","countries")
//     .selectAll("path")
//       .data(topojson.feature(africa, africa.objects.countries).features)
//     .enter().append("path")
//       .attr("d", path)
//     .append("title")
//       .text(function(d) { return d.properties.admin })

// })

// d3.select(self.frameElement).style("height", height + "px")

// Lab Module 2-1, All Lessons
const width = 900, height = 500

const x = d3.scaleLinear()
    .range([90, 750])
    .domain([0, 3])

const dataArray = [10, 20, 30, 40, 50]

var cityPop = [
  { 
      city: 'Madison',
      population: 233209
  },
  {
      city: 'Milwaukee',
      population: 594833
  },
  {
      city: 'Green Bay',
      population: 104057
  },
  {
      city: 'Superior',
      population: 27244
  }
]

const extentPop = d3.extent(cityPop, function(d){
  return d.population
})

const y = d3.scaleLinear()
    .range([450, 50])
    // .domain(extentPop)
    .domain([0, 700000])

// const yAxis = d3.axisLeft(y)
//     .scale(y)
//     .orient("left")

const colorScale = d3.scaleLinear()
    .range([
        "#FDBE85",
        "#D94701"
    ])
    .domain([
        extentPop[0],
        extentPop[1],
    ])

const container = d3.select("body")
      .append("svg") 
        .attr("width", width) 
        .attr("height", height) 
        .attr("class", "container")
        .style("background-color", "rgba(0,0,0,0.2)")
        
const innerRect = container.append("rect")
        .datum(400)
        .attr("width", function(d){
          return d * 2
        })
        .attr("height", function(d){
          return d
        })
        .attr("class", "innerRect")
        .attr("x", 50) 
        .attr("y", 50) 
        .style("fill", "#FFFFFF")

const circles = container.selectAll(".circles")
        .data(cityPop)
        .enter()
        .append("circle")
          .attr("class", "circles")
          .attr("id", function(d){return d.city})
          .attr("r", function(d, i){ 
              var area = d.population * 0.01
              return Math.sqrt(area/Math.PI)
          })
          .attr("cx", function(d, i){
              return x(i)
          })
          .attr("cy", function(d){
              return y(d.population)
          })
          .style("fill", function(d, i){
            return colorScale(d.population)
          })
          .style("stroke", "#000")

const axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50, 0)")
        .call(d3.axisLeft(y))

const title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("City Populations")

const labels = container.selectAll(".labels")
        .data(cityPop)
        .enter()
        .append("text")
          .attr("class", "labels")
          .attr("text-anchor", "left")
          .attr("y", function(d){
              return y(d.population) + 5;
          })

const nameLine = labels.append("tspan")
          .attr("class", "nameLine")
          .attr("x", function(d,i){
              return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
          })
          .text(function(d){
              return d.city;
          })

const popFormat = d3.format(",")
  
const popLine = labels.append("tspan")
          .attr("class", "popLine")
          .attr("x", function(d,i){
              return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
          })
          .attr("dy", "15")
          .text(function(d){
              return "Pop. " + popFormat(d.population);
          })