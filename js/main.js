// main.js
// author: Andrew Pittman

// Corruption and Governance map of Africa
let currentIndicator = 'CorruptionPerceptionIndex2015'
const body = d3.select("body")
const container = d3.select(".map-container")
const chart = d3.select(".bar-chart")
const tooltip = d3.select(".main-tooltip")

const widthBody = parseInt(body.style("width"))

const width = parseInt(container.style("width"))
const height = width - (width * 0.03)

const projection = d3.geoMercator() // projection used for the mercator projection
    .center([17, 1])
    .scale(width/1.5)
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
                        "name": "Corruption Perception Index",
                        "infoCardText": "Transparency International\'s Corruption Perception Index: Low scores indicate that a country is perceived as highly corrupt.",
                        "infoCardLinkURL": "https://ourworldindata.org/corruption",
                        "infoCardLinkTitle": "Our World in Data",
                        "formatText": ".0f",
                        "formatScale": ".0f",
                        "domainData": [0, 100], 
                        "domainBar": [0, 100],
                        "order": "ascending"}, 
                    {"indicator": "CorruptionControl2015", 
                        "name": "Corruption Control",
                        "infoCardText": "World Bank's Corruption Control Index: Perceptions of the extent to which public power is exercised for private gain, including both petty and grand forms of corruption, as well as \"capture\" of the state by elites and private interests.",
                        "infoCardLinkURL": "https://wid.world/data/",
                        "infoCardLinkTitle": "World Inequality Database",
                        "formatText": ".0f", 
                        "formatScale": ".0f",
                        "domainData": [0, 100],
                        "domainBar": [0, 100],
                        "order": "ascending"},
                    {"indicator": "IbrahimIndex2015", 
                        "name": "Ibrahim Index Rank",
                        "infoCardText": "The Ibrahim Index of African Governance (IIAG), generated my the Mo Ibrahim Foundation, ranks governance performance in African countries.",
                        "infoCardLinkURL": "http://dataportal.opendataforafrica.org/lfkgixg/governance",
                        "infoCardLinkTitle": "Africa Information Highway",
                        "formatText": ".0f", 
                        "formatScale": ".0f",
                        "domainData": [55, 0],
                        "domainBar": [0, 55],
                        "order": "descending"},
                    {"indicator": "EaseOfDoingBusinessRank2015", 
                        "name": "Ease of Doing Business Rank",
                        "infoCardText": "This topic tracks the procedures that agregate a number of indicators that shows the global level of difficulty of doing business in a given country",
                        "infoCardLinkURL": "http://dataportal.opendataforafrica.org/lfkgixg/governance",
                        "infoCardLinkTitle": "Africa Information Highway",
                        "formatText": ".0f", 
                        "formatScale": ".0f",
                        "domainData": [195, 0],
                        "domainBar": [0, 195],
                        "order": "descending"}, 
                    {"indicator": "NAIPerAdultDollars2017", 
                        "name": "National Average Income Per Adult",
                        "infoCardText": "National income garnered by every adult in a country divided by the number of adults in that country. Converted to USD.",
                        "infoCardLinkURL": "https://wid.world/data/",
                        "infoCardLinkTitle": "World Inequality Database",
                        "formatText": "$,.0f", 
                        "formatScale": "~s",
                        "domainData": [0, 35000],
                        "domainBar": [0, 35000],
                        "order": "ascending"}, 
                    {"indicator": "GDPPerAdultDollars2017", 
                        "name": "Gross Domestic Product Per Adult",
                        "infoCardText": "Gross domestic product total generated by a country divided by the number of adults in that country. Converted to USD.",
                        "infoCardLinkURL": "https://wid.world/data/",
                        "infoCardLinkTitle": "World Inequality Database",
                        "formatText": "$,.0f", 
                        "formatScale": "~s",
                        "domainData": [0, 45000],
                        "domainBar": [0, 45000],
                        "order": "ascending"}
                    ]

const attributeMap = d3.map(attributes, d => d.indicator)

const selectionIndicator = "CorruptionPerceptionIndex2015"
        
const transitionDuration = 1000

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
    .range(['red', 'black'])

const colorScaleMoney = d3.scaleLinear()
    .range(['black', 'green'])

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
        if (feature.properties.CONTINENT == "Africa" || ['SC', 'MU'].includes(feature.properties.ISO_A2 )) {
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
                if (d.properties.CorruptionPerceptionIndex2015) { 
                   return colorScale(d.properties.CorruptionPerceptionIndex2015) 
                }
             })
             .on("mousemove", moveToolTip)
             .on("mouseout", hideToolTip)
    
    return africaArray
 }

 function moveToolTip(d) {
    if (d.properties.CorruptionPerceptionIndex2015) { 
       const cPFormat = d3.format(attributeMap.get(selectionIndicator).formatText)
       tooltip.html(`
          <p>${d.properties.ADMIN}<span class="number"> ${cPFormat(d.properties[currentIndicator])}</span></p>          
       `) 
       tooltip.style('opacity', 1)
       let mouseX = d3.event.pageX
       const tooltipWidth = parseInt(tooltip.style('width'))
       if ((mouseX + tooltipWidth + 20) >= widthBody - 17) {
           mouseX = (widthBody - tooltipWidth - 20 - 17)
       }
       tooltip.style('left', (mouseX + 10) + 'px')
       tooltip.style('top', (d3.event.pageY + 20) + 'px')
       
       d3.selectAll("." + d.properties.ISO_A2)
          .style('stroke', '#fff')
          .style('stroke-width', '2.5')
          .raise()
    }
 }
 
 function hideToolTip(d) {
    if (d.properties.CorruptionPerceptionIndex2015) {
        tooltip.style('opacity', 0)
        d3.select(".country." + d.properties.ISO_A2)
            .style('stroke', 'white')
            .style('stroke-width', '1')
        d3.select(".bar." + d.properties.ISO_A2)
            .style('stroke-width', '0')
    }
 }

 d3.select('.infocard')
    .style('left', 20 + 'px')
    .style('top', height/1.85 + 'px')
    .style('width', width/2.7 + 'px')
 d3.select('.card .card-header')
    .text(attributeMap.get(selectionIndicator).name)
    .style('font-weight', 700)
 d3.select('.card-text')
    .text(attributeMap.get(selectionIndicator).infoCardText)
 d3.select('.card .card-body a')
    .attr("href", attributeMap.get(selectionIndicator).infoCardLinkURL)
 d3.select('.sourceLink')
    .text(attributeMap.get(selectionIndicator).infoCardLinkTitle)

//  bar chart
const margin = {top: 20, right: 30, bottom: 30, left: 30}
const chartWidth = parseInt(chart.style("width")) - 30
const chartHeight = height
const chartWidthMargin = chartWidth - margin.left - margin.right
const chartHeightMargin = chartHeight - margin.top - margin.bottom

const barScale = d3.scaleLinear()
    .range([0, chartWidthMargin])
    .domain(attributeMap.get(selectionIndicator).domainBar);
 
var chartSVG = chart.append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("class", "chart")

const chartG = chartSVG.append('g')
    .attr("width", chartWidthMargin)
    .attr("height", chartHeightMargin)
    .attr('transform', `translate(${margin.left},${margin.top})`)

const barsG = chartG.append("g")
    .attr("class", "bars")

function createChart(africaArray) {
    const filteredAfricaArray = africaArray.filter(d => !isNaN(d.properties.CorruptionPerceptionIndex2015))
    const cPFormat = d3.format(attributeMap.get(selectionIndicator).formatText)
    const tickFormat = d3.format(attributeMap.get(selectionIndicator).formatScale)
    barsG
        .selectAll('path')
        .data(filteredAfricaArray)
        .enter()
            .append('rect')
                .sort((a, b) => (d3.descending(a.properties.CorruptionPerceptionIndex2015, b.properties.CorruptionPerceptionIndex2015)))
                .on("mousemove", moveToolTip)
                .on("mouseout", hideToolTip)
                .transition()
                    .delay(function(d, i){
                        return i * 15
                    })
                    .duration(transitionDuration)
                    .attr("class", d => 'bar ' + d.properties.ISO_A2)
                    .attr("width", d => {
                        var width = 0
                        if (d.properties.CorruptionPerceptionIndex2015) {
                            width = barScale(d.properties.CorruptionPerceptionIndex2015)
                        }
                        return width
                    })
                    .attr("x", 0)
                    .attr("height", (chartHeightMargin) / filteredAfricaArray.length - 2)
                    .attr("y", (d, i) => i * ((chartHeightMargin) / (filteredAfricaArray.length + 1)))
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
                .transition()
                    .delay(function(d, i){
                        return i * 15
                    })
                    .duration(transitionDuration).attr("class", d => 'data')
                    .attr("text-anchor", "right")
                    .attr("x", (d, i) => {
                        return 2                
//                         var x = 0
//                         if (d.properties.CorruptionPerceptionIndex2015) {
//                             x = barScale(d.properties.CorruptionPerceptionIndex2015)
//                         }
//                         return x - 38
                    })
                    .attr("y", (d, i) => {
                        const fraction = (chartHeightMargin) / (filteredAfricaArray.length + 1)
                        return (i + 0.9) * fraction + 1
                    })
                    .text(d => d.properties.NAME)

    chartG.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (chartHeightMargin) + ")")
        .call(d3.axisBottom(barScale)
            .ticks(10)
            .tickFormat(tickFormat))
}

function rerender(selectionIndicator) {
    
    currentIndicator = selectionIndicator
    
    const dataString = "d.properties." + selectionIndicator
    const indicatorOptions = attributeMap.get(selectionIndicator)
    const cPFormat = d3.format(indicatorOptions.formatText)
    const tickFormat = d3.format(indicatorOptions.formatScale)
     
    const colorDomain = d3.extent(africaArray, d=> d.properties[selectionIndicator]).sort(d3[indicatorOptions.order])
    if (attributeMap.get(selectionIndicator).formatText.includes('$')) {
        colorScaleMoney.domain(colorDomain)
        var moneyFlag = true
    } else {        
        colorScale.domain(colorDomain)
        var moneyFlag = false
    }

    // Reset indicator text on nav bar
    d3.select("#navbarDropdownMenuLink")
        .text(attributeMap.get(selectionIndicator).name)
    
    // Change map fill and tooltip text upon indicator change
    d3.selectAll(".country")
        .transition()
            .duration(transitionDuration)
            .style("fill", d => {
                outColor = "#808080"
                if (d.properties[selectionIndicator]) {
                    if (moneyFlag) {
                        outColor = colorScaleMoney(d.properties[selectionIndicator])
                    } else {
                        outColor = colorScale(d.properties[selectionIndicator])
                    }
                }
                return outColor
            })
    
    d3.select('.card .card-header')
        .text(attributeMap.get(selectionIndicator).name)
    d3.select('.card-text')
        .text(attributeMap.get(selectionIndicator).infoCardText)
    d3.select('.card .card-body a')
        .attr("href", attributeMap.get(selectionIndicator).infoCardLinkURL)
    d3.select('.sourceLink')
        .text(attributeMap.get(selectionIndicator).infoCardLinkTitle)
    
    barScale.domain(attributeMap.get(selectionIndicator).domainBar)
    const filteredAfricaArray = africaArray.filter(d => !isNaN(d.properties[selectionIndicator]))
    
//     const sortFunction = (selectionIndicator.includes('Ibrahim') || selectionIndicator.includes('Business')) ? 'ascending' : 'descending'
//     return d3[sortFunction](a.properties[selectionIndicator], b.properties[selectionIndicator])
    const sortFunction = (a, b) => {
            if (selectionIndicator.includes('Ibrahim') || selectionIndicator.includes('Business')) {
                return d3.ascending(a.properties[selectionIndicator], b.properties[selectionIndicator])
            } else {
                return d3.descending(a.properties[selectionIndicator], b.properties[selectionIndicator])
            }
        }
    
    d3.selectAll(".bar")
        .sort(sortFunction)
        .on("mousemove", moveToolTip)
        .on("mouseout", hideToolTip)
        .transition()
            .delay(function(d, i){
                return i * 15
            })
            .duration(transitionDuration)
            .attr("width", d => {
                var width = 0
                if (d.properties[selectionIndicator]) {
                    width = barScale(d.properties[selectionIndicator])
                }
                return width
            })
            .attr("x", 0)
            .attr("y", (d, i) => i * (chartHeightMargin / (filteredAfricaArray.length + 1)))
            .style('fill', d => {
                if (d.properties[selectionIndicator]) {
                    if (moneyFlag) {
                        return colorScaleMoney(d.properties[selectionIndicator])
                    } else {
                        return colorScale(d.properties[selectionIndicator])
                    }
                }
            })
    
    d3.select(".axis")
        .call(d3.axisBottom(barScale)
            .tickFormat(tickFormat))
      
    d3.selectAll(".data")
        .sort(sortFunction)
        .transition()
            .delay(function(d, i){
                return i * 15
            })
            .duration(transitionDuration)
            .attr("x", (d, i) => {
                var x = 0
                if (d.properties[selectionIndicator]) {
                    x = barScale(d.properties[selectionIndicator])
                }
                return x - 20
            })
            .attr("y", (d, i) => {
                const fraction = chartHeightMargin / (filteredAfricaArray.length + 1)
                return (i + 0.9) * fraction 
            })
            // .text(d => cPFormat(d.properties.ISO_A2))
}
