var humanReadable = {
    'passenger_revenue': 'Passenger Revenue',
    'cargo_revenue': 'Cargo Revenue',
    'other_revenue': 'Other Revenue',
    'aircraft_fuel': 'Aircraft Fuel Cost',
    'aircraft_maintenance': 'Aircraft Maintenance Cost',
    'commissions': 'Commissions',
    'ground_handling': 'Ground Handling',
    'salaries_wages': 'Salaries and Wages',
    'aircraft_lease': 'Aircraft Lease',
    'overheads': 'Corporate Overheads',
    'non_operating_items': 'Non Operating Items',
    'block_hours': 'Block Hours',
    'flight_hours': 'Flight Hours',
    'departures': 'Departures',
    'rev_pax_miles': 'Revenue Passenger Miles',
    'avail_seat_miles': 'Available Seat Miles',
    'fuel_gallons': 'Fuel Gallons'
}
var notebookElement = document.getElementById("output-column-body");

function getActionableInfo(result) {
    var actionableOutput = JSON.parse(result)
    console.log(actionableOutput)
    // Check if tere is any action in the reposonse
    if (actionableOutput.output.hasOwnProperty('action')) {
        // Check if the action is to get revenue or stats
        if (actionableOutput.output.action.request_type === 'get_financials' ||
            actionableOutput.output.action.request_type === 'get_stats'
        ) {
            // Check if the request is for one period
            if (actionableOutput.output.action.period === 'single') {
                itemForSinglePeriod(actionableOutput);
                // otherwise multi period request
            } else {
                // if the user wants the output in table format
                if (actionableOutput.context.output_type === 'table') {
                    tableForMultiplePeriod(actionableOutput)
                }
                // if thr user wants the output in graph format
                else if (actionableOutput.context.output_type === 'graph') {
                    graphForMultiplePeriod(actionableOutput)
                }
            }
            // Check if the action is to get comparison financials and stats
        } else if (actionableOutput.output.action.request_type === 'comparison_financials' ||
            actionableOutput.output.action.request_type === 'comparison_stats') {
            // Check if the request is for one month and different year e.g. Jan pax rev for 2017 vs. 2016
            if (actionableOutput.output.action.period === 'single') {
                singlePeriodComparisonForMultipleMonths(actionableOutput)
            }
            // Check if the request is for multiple months and different years e.g. Jan-Mar for 2017 vs 2016
            else if (actionableOutput.output.action.period === 'multi') {
                // Check if user wants month over month comparison
                if (actionableOutput.context.output_type === 'month_over_month') {
                    multiPeriodComparison(actionableOutput)
                }
                // Check if user wants cumulative output
                else if (actionableOutput.context.output_type === 'cumulative') {
                    singlePeriodComparisonForMultipleMonths(actionableOutput)
                }
            }
        }
    }
}

function itemForSinglePeriod(actionableOutput) {
    if (actionableOutput.output.action.request_type === 'get_financials') {
        requestType = 'get_financials'
    } else if (actionableOutput.output.action.request_type === 'get_stats') {
        requestType = 'get_stats'
    };

    $.ajax({
        url: "api/v1/data/filtered",
        method: 'GET',
        data: {
            financial_year_id_start: actionableOutput.context.start_year,
            financial_year_id_end: actionableOutput.context.end_year,
            financial_month_id_start: actionableOutput.context.start_month,
            financial_month_id_end: actionableOutput.context.end_month,
            request_type: requestType
        },
        success: function (data) {
            console.log(data)


            var elementType = actionableOutput.output.action.element_type,
                year = data[0].financial_year,
                month = data[0].financial_month,
                elementValue = data[0][elementType],
                totalValue = 0,
                counter = 0;

            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                totalValue += parseInt(record[elementType]);
                counter++
            }
            var paraNode = document.createElement('p');
            paraNode.className = "card card-body";
            if (counter > 1) {
                var textToAppend = humanReadable[elementType] + " for " + year + ": " + String(totalValue.toLocaleString('en'));
            } else {
                var textToAppend = humanReadable[elementType] + " for " + month + " " +
                    year + ": " + String(totalValue.toLocaleString('en'));
            }
            paraNode.innerHTML = textToAppend
            notebookElement.appendChild(paraNode)
            $(notebookElement).animate({
                scrollTop: document.body.scrollHeight
            }, "fast");

        },
        error: function (error_data) {
            console.log("error")
            console.log(error_data)
        }
    })
}

function tableForMultiplePeriod(actionableOutput) {
    if (actionableOutput.output.action.request_type === 'get_financials') {
        requestType = 'get_financials'
    } else if (actionableOutput.output.action.request_type === 'get_stats') {
        requestType = 'get_stats'
    };
    $.ajax({
        url: "api/v1/data/filtered",
        method: 'GET',
        data: {
            financial_year_id_start: actionableOutput.context.start_year,
            financial_year_id_end: actionableOutput.context.end_year,
            financial_month_id_start: actionableOutput.context.start_month,
            financial_month_id_end: actionableOutput.context.end_month,
            request_type: requestType
        },
        success: function (data) {
            var elementType = actionableOutput.context.element_type;

            // Select notebook and creat table into it
            var newNode = document.createElement('div');
            newNode.className = "output-table-wrapper";

            var panelTitle = document.createElement('div');
            panelTitle.className = "panel-title-table";

            var table = document.createElement('table');
            table.setAttribute("class", "table table-striped")
            table.setAttribute("id", "output-table")
            var tableBody = document.createElement('tbody');
            var th = document.createElement("th")
            tableBody.appendChild(th);
            th.appendChild(document.createTextNode(""));
            var th = document.createElement("th")
            tableBody.appendChild(th);
            th.appendChild(document.createTextNode("Month"));
            var th = document.createElement("th")
            tableBody.appendChild(th);
            th.appendChild(document.createTextNode("Value"));
            counter = 1

            for (var i = 0; i < data.length; i++) {
                var record = data[i];

                table.appendChild(tableBody);
                var tr = document.createElement('tr');
                tableBody.appendChild(tr);
                var tdCounter = document.createElement('td');
                tdCounter.style.width = '3px';
                var monthColumn = document.createElement('td');
                var valueColumn = document.createElement('td');
                monthColumn.appendChild(document.createTextNode(record.financial_month + " " + record.financial_year));
                valueColumn.appendChild(document.createTextNode(record[elementType]));
                tdCounter.appendChild(document.createTextNode(counter++));
                tr.appendChild(tdCounter);
                tr.appendChild(monthColumn);
                tr.appendChild(valueColumn);
            }

            var textToAppend = humanReadable[elementType] + " " +
                data[0].financial_month + " to " + data[data.length - 1].financial_month + " " +
                data[0].financial_year;
            panelTitle.innerHTML = textToAppend
            newNode.appendChild(table);
            notebookElement.appendChild(panelTitle);
            notebookElement.appendChild(newNode);
            $(notebookElement).animate({
                scrollTop: document.body.scrollHeight
            }, "slow");

        },
        error: function (error_data) {
            console.log("error")
            console.log(error_data)
        }
    })
}

function graphForMultiplePeriod(actionableOutput) {
    if (actionableOutput.output.action.request_type === 'get_financials') {
        requestType = 'get_financials'
    } else if (actionableOutput.output.action.request_type === 'get_stats') {
        requestType = 'get_stats'
    };
    $.ajax({
        url: "api/v1/data/filtered",
        method: 'GET',
        data: {
            financial_year_id_start: actionableOutput.context.start_year,
            financial_year_id_end: actionableOutput.context.end_year,
            financial_month_id_start: actionableOutput.context.start_month,
            financial_month_id_end: actionableOutput.context.end_month,
            request_type: requestType
        },
        success: function (data) {
            console.log(data)
            var elementType = actionableOutput.context.element_type;

            // Select notebook and creat table into it
            var newNode = document.createElement('div');
            newNode.className = "output-svg-wrapper";
            var panelTitle = document.createElement('div');
            panelTitle.className = "panel-title-table";
            var barChart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            barChart.setAttribute("class", "d3-barChart")
            barChart.setAttribute("height", "300")
            barChart.setAttribute("width", "740")

            // Append title
            var totalValue = 0;
            var textToAppend = humanReadable[elementType] + " " +
                data[0].financial_month + " to " + data[data.length - 1].financial_month + " " +
                data[0].financial_year;
            panelTitle.innerHTML = textToAppend;
            notebookElement.appendChild(panelTitle);

            // Append Chart
            newNode.appendChild(barChart);
            notebookElement.appendChild(newNode);

            var svg = d3.select(barChart),
                margin = {
                    top: 20,
                    right: 30,
                    bottom: 30,
                    left: 10
                };

            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                totalValue += parseInt(record[elementType]);

                var width = +svg.attr("width") - margin.left - margin.right,
                    height = +svg.attr("height") - margin.top - margin.bottom;

                var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
                    y = d3.scaleLinear().rangeRound([height, 0]);

                var g = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                x.domain(data.map(function (d) {
                    return d.financial_month + " " + d.financial_year;
                }));
                y.domain([0, d3.max(data, function (d) {
                    return (d[elementType]);
                })]);

                var xAxis = d3.axisBottom(x);


                g.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                    .selectAll(".tick text")
                    .call(wrap, x.bandwidth());
                // For axis text
                //                g.append("g")
                //                    .attr("class", "axis axis--y")
                //                    .call(d3.axisLeft(y).ticks(null, "$"))
                //                    .append("text")
                //                    .attr("transform", "rotate(-90)")
                //                    .attr("y", 6)
                //                    .attr("dy", "0.71em")
                //                    .attr("text-anchor", "end")
                //                    .text("Value");

                g.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function (d) {
                        return x(d.financial_month + " " + d.financial_year);
                    })
                    .attr("y", function (d) {
                        return y(d[elementType]);
                    })
                    .attr("width", x.bandwidth())
                    .attr("height", function (d) {
                        return height - y(d[elementType]);
                    });

                g.selectAll(".text")
                    .data(data)
                    .enter()
                    .append("text")
                    .attr("class", "label")
                    .attr("x", (function (d) {
                        return x(d.financial_month + " " + d.financial_year) + 10;
                    }))
                    .attr("y", function (d) {
                        return y(d[elementType]) + 5;
                    })
                    .attr("dy", ".75em")
                    .text(function (d) {
                        return ((d[elementType]) / 1).toFixed();
                    })
                    .attr("font-size", "0.8em")
                    .attr("fill", "white");
            }
            svg.append("text")
                .text("Total: " + (String(totalValue.toLocaleString('en'))))
                .attr("class", "totalValue")
                .attr("x", 600)
                .attr("y", 12)
                .attr("fill", "#975AD1")
                .attr("font-weight", "bold");

            // Copying wrap text method directly from Mike Bostock

            function wrap(text, width) {
                text.each(function () {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        y = text.attr("y"),
                        dy = parseFloat(text.attr("dy")),
                        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                        }
                    }
                });
            }

            $(notebookElement).animate({
                scrollTop: document.body.scrollHeight
            }, "slow");

        },
        error: function (error_data) {
            console.log("error")
            console.log(error_data)
        }
    })
}

function multiPeriodComparison(actionableOutput) {
    if (actionableOutput.output.action.request_type === 'comparison_financials') {
        requestType = 'comparison_financials'
    } else if (actionableOutput.output.action.request_type === 'comparison_stats') {
        requestType = 'comparison_stats'
    };
    $.ajax({
        url: "api/v1/data/comparison",
        method: 'GET',
        data: {
            financial_year_id_first: actionableOutput.context.first_year,
            financial_year_id_second: actionableOutput.context.second_year,
            financial_month_id_start: actionableOutput.context.start_month,
            financial_month_id_end: actionableOutput.context.end_month,
            request_type: requestType,
            request_period: 'multiple'
        },
        success: function (data) {
            var elementType = actionableOutput.context.element_type;

            // Copied from SO, no idea what's going on here
            let transposedData = Object.values(data.reduce((a, c) => {
                (a[c.financial_month] || (a[c.financial_month] = {
                    Month: c.financial_month
                }))[c.financial_year] = c[elementType]
                return a
            }, {}))

            console.log(transposedData)

            // Create the SVG
            var comparisonGraphNode = document.createElement('div');
            comparisonGraphNode.className = "comparison-svg-wrapper";
            var panelTitle = document.createElement('div');
            panelTitle.className = "panel-title-table";
            var comparisonChart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            comparisonChart.setAttribute("class", "d3-barChart")
            comparisonChart.setAttribute("height", "300")
            comparisonChart.setAttribute("width", "740")

            // Append title
            var totalValue = 0;
            var textToAppend = humanReadable[elementType] + " " +
                data[0].financial_month + " to " + data[data.length - 1].financial_month;
            panelTitle.innerHTML = textToAppend;
            notebookElement.appendChild(panelTitle);

            // Append Chart and SVG
            comparisonGraphNode.appendChild(comparisonChart);
            notebookElement.appendChild(comparisonGraphNode);

            // Build the chart

            var svg = d3.select(comparisonChart),
                margin = {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 40
                },
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom,
                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var x0 = d3.scaleBand()
                .rangeRound([0, width])
                .paddingInner(0.1);

            var x1 = d3.scaleBand()
                .padding(0.05);

            var y = d3.scaleLinear()
                .rangeRound([height, 0]);

            var z = d3.scaleOrdinal()
                .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

            var years = []
            data.forEach((val, index) => {
                years.push(val.financial_year)
            });

            var keys = Array.from(new Set(years))

            var tooltip = d3.selectAll("body")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("padding", "0 10px")
                .style("background", "#0C5A81")
                .style("color", "white")

            x0.domain(transposedData.map(function (d) {
                return d.Month;
            }));
            x1.domain(keys).rangeRound([0, x0.bandwidth()]);
            y.domain([0, d3.max(transposedData, function (d) {
                return d3.max(keys, function (key) {
                    return d[key];
                });
            })]).nice();

            g.append("g")
                .selectAll("g")
                .data(transposedData)
                .enter().append("g")
                .attr("transform", function (d) {
                    return "translate(" + x0(d.Month) + ",0)";
                })
                .selectAll("rect")
                .data(function (d) {
                    return keys.map(function (key) {
                        return {
                            key: key,
                            value: d[key]
                        };
                    });
                })
                .enter().append("rect")
                .attr("x", function (d) {
                    return x1(d.key);
                })
                .attr("y", function (d) {
                    return y(d.value);
                })
                .attr("width", x1.bandwidth())
                .attr("height", function (d) {
                    return height - y(d.value);
                })
                .attr("fill", function (d) {
                    return z(d.key);
                })
                .on("mouseover", function (d) {
                    tooltip.transition().duration(200)
                        .style("opacity", .8);
                    tooltip.html(d.value)
                        .style("left", (d3.event.pageX - 35) + "px")
                        .style("top", (d3.event.pageY - 30) + "px")
                })
                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x0));

            g.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).ticks(null, "s"))
                .append("text")
                .attr("x", 2)
                .attr("y", y(y.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")


            var legend = g.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "end")
                .selectAll("g")
                .data(keys.slice().reverse())
                .enter().append("g")
                .attr("transform", function (d, i) {
                    return "translate(0," + i * 20 + ")";
                });

            legend.append("rect")
                .attr("x", width - 19)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", z);

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9.5)
                .attr("dy", "0.32em")
                .text(function (d) {
                    return d;
                });

            $(notebookElement).animate({
                scrollTop: document.body.scrollHeight
            }, "slow");
        },
        error: function (error_data) {
            console.log("error")
            console.log(error_data)
        }
    })
}

function singlePeriodComparisonForMultipleMonths(actionableOutput) {
    if (actionableOutput.output.action.request_type === 'comparison_financials') {
        requestType = 'comparison_financials'
    } else if (actionableOutput.output.action.request_type === 'comparison_stats') {
        requestType = 'comparison_stats'
    };
    $.ajax({
        url: "api/v1/data/comparison",
        method: 'GET',
        data: {
            financial_year_id_first: actionableOutput.context.first_year,
            financial_year_id_second: actionableOutput.context.second_year,
            financial_month_id_start: actionableOutput.context.start_month,
            financial_month_id_end: actionableOutput.context.end_month,
            request_type: requestType,
            request_period: 'single'
        },
        success: function (data) {
            var elementType = actionableOutput.context.element_type;
            var firstYear = data[0].financial_year;
            var secondYear = data[data.length - 1].financial_year

            // Create parent node
            var comparisonCardNode = document.createElement('div');
            comparisonCardNode.className = "card";
            // Tell what are we comparding?
            var comparisonCardTitle = document.createElement('h5');
            comparisonCardTitle.className = "card-title";
            if (data.length > 2) {
                comparisonCardTitle.innerHTML = humanReadable[elementType] + ": " + data[0].financial_month +
                    " to " + data[data.length - 1].financial_month;

            } else {
                comparisonCardTitle.innerHTML = humanReadable[elementType] + " for " + data[0].financial_month
            }

            // Tell the actual information

            //Create sub-title
            var comparisonCardSubTitle = document.createElement('h6');
            comparisonCardSubTitle.className = "card-subtitle mb-2";
            // Create text for sub-title
            var latestYearNumber = 0;
            var previousYearNumber = 0;

            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                if (record.financial_year == firstYear) {
                    latestYearNumber += parseInt(record[elementType]);
                } else if (record.financial_year == secondYear) {
                    previousYearNumber += parseInt(record[elementType]);
                }
            }
            var yearOneText = firstYear + ": " + latestYearNumber;
            var yearTwoText = secondYear + ": " + previousYearNumber;
            comparisonCardSubTitle.innerHTML = yearOneText + " ; " + yearTwoText;

            // Provide the actual comments e.g. variance up or down
            var actualVariance = (latestYearNumber - previousYearNumber).toFixed(1);
            var variancePercentage = ((actualVariance / previousYearNumber) * 100).toFixed() + "%";
            var upOrDown = "";
            if (latestYearNumber > previousYearNumber) {
                upOrDown = "Up"
            } else {
                upOrDown = "Down"
            }
            var comparisonCardBody = document.createElement('div');
            comparisonCardBody.className = "card-body";
            var comparisonCardText = document.createElement('p');
            comparisonCardText.className = "card-text";
            comparisonCardText.innerHTML = upOrDown + " " + actualVariance + " OR " + variancePercentage;

            comparisonCardBody.appendChild(comparisonCardTitle);
            comparisonCardBody.appendChild(comparisonCardSubTitle);
            comparisonCardBody.appendChild(comparisonCardText);
            comparisonCardNode.appendChild(comparisonCardBody);
            notebookElement.appendChild(comparisonCardNode);

            $(notebookElement).animate({
                scrollTop: document.body.scrollHeight
            }, "slow");

        },
        error: function (error_data) {
            console.log("error")
            console.log(error_data)
        }
    })
}
