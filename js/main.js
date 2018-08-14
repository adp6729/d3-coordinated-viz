// main.js
// author: Andrew Pittman

// Corruption and Governance map of Africa

// Initialize variables
let currentIndicator = 'CorruptionPerceptionIndex2015'
const body = d3.select("body")
const container = d3.select(".map-container")
const chart = d3.select(".bar-chart")
const tooltip = d3.select(".main-tooltip")

const widthBody = parseInt(body.style("width"))

const width = parseInt(container.style("width"))
const height = width - (width * 0.03)

// create projection and path generator
const projection = d3.geoMercator() // projection used for the mercator projection
    .center([17, 1]) // center and zoom on African continent
    .scale(width/1.5)
    .translate([width / 2, height / 2])

const pathGenerator = d3.geoPath()
    .projection(projection)

// create map container and countries group
var svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)

const countriesG = svg.append('g')
    .attr('class', 'countries')

// Handle data initialization for each indicator
const attributes = [ {"indicator": "CorruptionPerceptionIndex2015",
                        "name": "Corruption Perception Index",
                        "infoCardText": "Transparency International\'s Corruption Perception Index (CPI). The CPI generally defines corruption as \"the misuse of public power for private benefit\". Low scores (darker) indicate that a country is perceived as highly corrupt.",
                        "infoCardLinkURL": "https://ourworldindata.org/corruption",
                        "infoCardLinkTitle": "Our World in Data",
                        "formatText": ".0f",
                        "formatScale": ".0f",
                        "domainData": [0, 100], 
                        "domainBar": [0, 100],
                        "order": "ascending"}, 
                    {"indicator": "CorruptionControl2015", 
                        "name": "Corruption Control",
                        "infoCardText": "World Bank's Corruption Control Index: Perceptions of the extent to which public power is exercised for private gain, including both all forms of corruption, as well as \"capture\" of the state by elites and private interests. Low scores (darker) indicate that a country is perceived as highly corrupt.",
                        "infoCardLinkURL": "https://wid.world/data/",
                        "infoCardLinkTitle": "World Inequality Database",
                        "formatText": ".0f", 
                        "formatScale": ".0f",
                        "domainData": [0, 100],
                        "domainBar": [0, 100],
                        "order": "ascending"},
                    {"indicator": "IbrahimIndex2015", 
                        "name": "Ibrahim Index Rank",
                        "infoCardText": "The Ibrahim Index of African Governance (IIAG) ranks governance performance in African countries, assessing safety, rule of law, participation, human rights, sustainable economic opportunity and human development. Lower rankings (darker) indicate that a country's governance is poor.",
                        "infoCardLinkURL": "http://dataportal.opendataforafrica.org/lfkgixg/governance",
                        "infoCardLinkTitle": "Africa Information Highway",
                        "formatText": ".0f", 
                        "formatScale": ".0f",
                        "domainData": [55, 0],
                        "domainBar": [0, 55],
                        "order": "descending"},
                    {"indicator": "EaseOfDoingBusinessRank2015", 
                        "name": "Ease of Doing Business Rank",
                        "infoCardText": "This metric tracks the procedures that agregate a number of indicators depicting the global level of difficulty of doing business in a given country. Metric depicts ranking on a global scale (195 nations). Lower rankings (darker) indicate increased difficulty conducting business in a country.",
                        "infoCardLinkURL": "http://dataportal.opendataforafrica.org/lfkgixg/governance",
                        "infoCardLinkTitle": "Africa Information Highway",
                        "formatText": ".0f", 
                        "formatScale": ".0f",
                        "domainData": [195, 0],
                        "domainBar": [0, 195],
                        "order": "descending"}, 
                    {"indicator": "NAIPerAdultDollars2017", 
                        "name": "National Average Income Per Adult",
                        "infoCardText": "National income garnered by every adult in a country divided by the number of adults in that country. Converted to USD. Lower monetary amounts (darker) indicate less income availability for a country's citizens.",
                        "infoCardLinkURL": "https://wid.world/data/",
                        "infoCardLinkTitle": "World Inequality Database",
                        "formatText": "$,.0f", 
                        "formatScale": "~s",
                        "domainData": [0, 35000],
                        "domainBar": [0, 35000],
                        "order": "ascending"}, 
                    {"indicator": "GDPPerAdultDollars2017", 
                        "name": "Gross Domestic Product Per Adult",
                        "infoCardText": "Gross domestic product total generated by a country divided by the number of adults in that country. Converted to USD. Lower monetary amounts (darker) indicate decreased work opportunity for a country's citizens.",
                        "infoCardLinkURL": "https://wid.world/data/",
                        "infoCardLinkTitle": "World Inequality Database",
                        "formatText": "$,.0f", 
                        "formatScale": "~s",
                        "domainData": [0, 45000],
                        "domainBar": [0, 45000],
                        "order": "ascending"}
                    ]

// Handle attribute mapping
const attributeMap = d3.map(attributes, d => d.indicator)

const selectionIndicator = "CorruptionPerceptionIndex2015"
        
const transitionDuration = 1000

// // Create Graticule, if needed (currently unused)
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
 

// initialize color scales for use
const colorScale = d3.scaleSequential(d3.interpolateInferno) // color scale for non money related indicators

const colorScaleMoney = d3.scaleLinear() // color scale for money related indicators
    .range(['black', '#55e862'])

const colorScaleText = d3.scaleLinear() // color scale to show greatest contrast for bar labels
    .range(['black', 'white'])
    .domain([-1,8])

// read in all data via Promise, then structure (js v5)
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

// first function after reading in data
function processData(results) {
    const geoJson = topojson.feature(results[0],results[0].objects.ne_50m_admin_0_countries_lakes)
    const cData = results[1]
    var africaArray = []
    for (const feature of geoJson.features) {
        // Only read in countries in the African continent, and Mauritius/Seychelles
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
            africaArray.push(feature) // push data that meets criteria to array for countries needed
        }
    }
    colorScale.domain(d3.extent(cData, d=>d[currentIndicator]))
    window.cData = cData // globalize
    window.africaArray = africaArray // globalize
    return africaArray
}

// second function after reading in data, utilizing africaArray
function createMap(africaArray) {
    // generate the paths for the African countries of interest
    countriesG
        .selectAll('path')
        .data(africaArray)
        .enter()
            .append('path')
                .attr('class', d => 'country ' + d.properties.ISO_A2) // assign classes for use later
                .attr('d', pathGenerator)
                .style('fill', d => {
                if (d.properties.CorruptionPerceptionIndex2015) { 
                    return colorScale(d.properties.CorruptionPerceptionIndex2015) 
                }
                })
                .on("mousemove", moveToolTip) // add mouse interaction capability
                .on("mouseout", hideToolTip)

    return africaArray
}

// when the mouse moves over a country or bar
function moveToolTip(d) {
    if (d.properties.CorruptionPerceptionIndex2015) { 
        // apply indicator specific formatting for tooltip
        const cPFormat = d3.format(attributeMap.get(currentIndicator).formatText)
        tooltip.html(`
            <p>${d.properties.ADMIN}<span class="number"> ${cPFormat(d.properties[currentIndicator])}</span></p>          
        `) 
        tooltip.style('opacity', 1)
        let mouseX = d3.event.pageX
        const tooltipWidth = parseInt(tooltip.style('width'))
        if ((mouseX + tooltipWidth + 20) >= widthBody - 17) { // handle case where the tooltip hits the edge of the body
            mouseX = (widthBody - tooltipWidth - 20 - 17)
        }
        tooltip.style('left', (mouseX + 10) + 'px') // specify tooltip location
        tooltip.style('top', (d3.event.pageY + 20) + 'px')
        
        d3.selectAll("." + d.properties.ISO_A2)
            .style('stroke', '#fff')
            .style('stroke-width', '2.5')
            .raise()
        d3.selectAll(".data")
            .raise()
    }
}

// when the mouse exits a country or bar
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

// create info card for indicator information and button w/ source link
d3.select('.infocard')
    .style('left', 20 + 'px')
    .style('top', height/1.85 + 'px')
    .style('width', width/2.6 + 'px')
d3.select('.card .card-header')
    .text(attributeMap.get(selectionIndicator).name)
    .style('font-weight', 700)
d3.select('.card-text')
    .text(attributeMap.get(selectionIndicator).infoCardText)
d3.select('.card .card-body a')
    .attr("href", attributeMap.get(selectionIndicator).infoCardLinkURL)
d3.select('.sourceLink')
    .text(attributeMap.get(selectionIndicator).infoCardLinkTitle)

// bar chart- initialize variables
const margin = {top: 20, right: 30, bottom: 30, left: 30}
const chartWidth = parseInt(chart.style("width")) - 30
const chartHeight = height
// add margin into chart width and height for buffer from map, body edge, and div edges (scale)
const chartWidthMargin = chartWidth - margin.left - margin.right
const chartHeightMargin = chartHeight - margin.top - margin.bottom

// create chart scale
const barScale = d3.scaleLinear()
    .range([0, chartWidthMargin])
    .domain(attributeMap.get(selectionIndicator).domainBar);

// create chart svg
var chartSVG = chart.append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("class", "chart")

// create overall chart group, transform appropriately
const chartG = chartSVG.append('g')
    .attr("width", chartWidthMargin)
    .attr("height", chartHeightMargin)
    .attr('transform', `translate(${margin.left},${margin.top})`)

// create group for just chart bars
const barsG = chartG.append("g")
    .attr("class", "bars")

// third function after data ingest, chart creation using africaArray
function createChart(africaArray) {
    const filteredAfricaArray = africaArray.filter(d => !isNaN(d.properties.CorruptionPerceptionIndex2015))
    const tickFormat = d3.format(attributeMap.get(selectionIndicator).formatScale)
    // create bar chart bars
    barsG
        .selectAll('path')
        .data(filteredAfricaArray)
        .enter()
            .append('rect')
                .sort((a, b) => (d3.descending(a.properties.CorruptionPerceptionIndex2015, b.properties.CorruptionPerceptionIndex2015)))
                .on("mousemove", moveToolTip)
                .on("mouseout", hideToolTip)
                .transition() // apply cascade transition
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
    // create bar chart labels
    barsG
        .selectAll('text')
        .data(filteredAfricaArray)
        .enter()
            .append('text')
                .sort((a, b) => (d3.descending(a.properties[currentIndicator], b.properties[currentIndicator])))
                .text(d => d.properties.NAME)                
                .attr("class", d => 'data')
                .transition() // apply cascade transition
                    .delay(function(d, i){
                        return i * 15 + 35
                    })
                    .duration(transitionDuration)
                    .attr("text-anchor", "right")
                    .attr("y", (d, i) => {
                        const fraction = (chartHeightMargin) / (filteredAfricaArray.length + 1)
                        return (i + 0.9) * fraction - 2
                    })
                    .style("fill", (d, i) => colorScaleText(i)) // dynamically change color of label based on index
                    .each(function(d,i) { // dynamically change location of label if the label is longer than the bar
                        textLength = this.getComputedTextLength()
                        d3.select(this)
                            .text(d => {
                                if (this.getComputedTextLength() + 2 > barScale(parseFloat(d.properties[currentIndicator]))) {
                                    return d.properties.ISO_A2
                                } else {
                                    return d.properties.NAME   
                                }
                            })
                            .attr("x", (d, i) => {
                                if (this.getComputedTextLength() + 2 > barScale(parseFloat(d.properties[currentIndicator]))) {
                                    return barScale(parseFloat(d.properties[currentIndicator]))
//                                     return 2
                                } else {
                                    return 2
                                }
                            })
                    })

    // add chart axis below bars
    chartG.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (chartHeightMargin) + ")")
        .call(d3.axisBottom(barScale)
            .ticks(10)
            .tickFormat(tickFormat)) // apply indicator specific formatting
}

// function called upon selection of a different indicator via boostrap menu
function rerender(selectionIndicator) {
    
    // initialize needed variables
    currentIndicator = selectionIndicator
    const indicatorOptions = attributeMap.get(selectionIndicator)
    const tickFormat = d3.format(indicatorOptions.formatScale)
    
    // modify and set color scale domain appropriately
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
                    if (moneyFlag) { // apply correct color scale to countries
                        outColor = colorScaleMoney(d.properties[selectionIndicator])
                    } else {
                        outColor = colorScale(d.properties[selectionIndicator])
                    }
                }
                return outColor
            })
    
    // update info card information, link and header to match current indicator
    d3.select('.card .card-header')
        .text(attributeMap.get(selectionIndicator).name)
    d3.select('.card-text')
        .text(attributeMap.get(selectionIndicator).infoCardText)
    d3.select('.card .card-body a')
        .attr("href", attributeMap.get(selectionIndicator).infoCardLinkURL)
    d3.select('.sourceLink')
        .text(attributeMap.get(selectionIndicator).infoCardLinkTitle)
    
    // update bar scale domain
    barScale.domain(attributeMap.get(selectionIndicator).domainBar)
    const filteredAfricaArray = africaArray.filter(d => !isNaN(d.properties[selectionIndicator]))
    
    // another way to accomplish the code in the next block, keeping for alternative options in the future
//     const sortFunction = (selectionIndicator.includes('Ibrahim') || selectionIndicator.includes('Business')) ? 'ascending' : 'descending'
//     return d3[sortFunction](a.properties[selectionIndicator], b.properties[selectionIndicator])

    // depending on the indicator, different sorting is needed, accomplished here
    const sortFunction = (a, b) => {
            if (selectionIndicator.includes('Ibrahim') || selectionIndicator.includes('Business')) {
                return d3.ascending(a.properties[selectionIndicator], b.properties[selectionIndicator])
            } else {
                return d3.descending(a.properties[selectionIndicator], b.properties[selectionIndicator])
            }
        }
    
    // rearrange all the bars in the bar chart
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
                    if (moneyFlag) { // apply correct color scale to countries
                        return colorScaleMoney(d.properties[selectionIndicator])
                    } else {
                        return colorScale(d.properties[selectionIndicator])
                    }
                }
            })
    
    // call new bar scale with updated tick format based on new indicator
    d3.select(".axis")
        .call(d3.axisBottom(barScale)
            .tickFormat(tickFormat))
    
    // rearrange and update all text labels associated with the bars
    d3.selectAll(".data")
        .sort(sortFunction)
        .text(d => d.properties.NAME)
        .transition()
            .delay(function(d, i){
                return i * 15
            })
            .duration(transitionDuration)
            .attr("y", (d, i) => {
                const fraction = chartHeightMargin / (filteredAfricaArray.length + 1)
                return (i + 0.9) * fraction - 2
            })            
            .style("fill", (d, i) => colorScaleText(i)) // dynamically change color of label based on index
            .each(function(d,i) { // dynamically change location of label if the label is longer than the bar
                textLength = this.getComputedTextLength()
                d3.select(this)
                    .text(d => {
                        if (this.getComputedTextLength() + 2 > barScale(parseFloat(d.properties[currentIndicator]))) {
                            return d.properties.ISO_A2
                        } else {
                            return d.properties.NAME   
                        }
                    })
                    .attr("x", (d, i) => {
                        if (this.getComputedTextLength() + 2 > barScale(parseFloat(d.properties[currentIndicator]))) {
                            return barScale(parseFloat(d.properties[currentIndicator]))
//                             return 2
                        } else {
                            return 2
                        }
                    })
            })
}
