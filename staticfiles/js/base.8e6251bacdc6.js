var humanReadable = {
    'passenger_revenue': 'Passenger Revenue',
    'cargo_revenue': 'Cargo Revenue',
    'other_revenue': 'Other Revenue'
}
var notebookElement = document.getElementById("output-column-body");

function getActionableInfo(result) {
    var actionableOutput = JSON.parse(result)
    // Check if tere is any action in the reposonse
    if (actionableOutput.output.hasOwnProperty('action')) {
        // Check if the action is to get revenue
        if (actionableOutput.intents[0].intent === 'get_revenue') {
            // Check if the request is for one period
            if (actionableOutput.output.action.period === 'single') {
                itemForSinglePeriod(actionableOutput);
            } else {
                // Otherwise its multiple period requests
                itemForMultiplePeriodForChart(actionableOutput)
            }
        }
    }
}

function itemForSinglePeriod(actionableOutput) {
    $.ajax({
        url: "api/v1/financial_data/filtered",
        method: 'GET',
        data: {
            financial_year_id: actionableOutput.output.action.year,
            financial_month_id: actionableOutput.output.action.month
        },
        success: function (data) {
            var elementType = actionableOutput.output.action.element_type;
            year = data[0].financial_year
            month = data[0].financial_month
            pax_rev = data[0][elementType]
            var newNode = document.createElement('div');
            newNode.className = "card card-body";
            var textToAppend = humanReadable[elementType] + " for " + month + " " + year + ": USD " + pax_rev;
            newNode.innerHTML = textToAppend
            notebookElement.appendChild(newNode)
            var newContent = document.createTextNode("Passenger revenue for " + month + " " + year + " is USD " + pax_rev);
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

function itemForMultiplePeriod(actionableOutput) {
    $.ajax({
        url: "api/v1/financial_data/filtered/multiperiod",
        method: 'GET',
        data: {
            financial_year_id_start: actionableOutput.output.action.year[0],
            financial_year_id_end: actionableOutput.output.action.year[1],
            financial_month_id_start: actionableOutput.output.action.month[0],
            financial_month_id_end: actionableOutput.output.action.month[1],
        },
        success: function (data) {
            var elementType = actionableOutput.output.action.element_type;

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
                monthColumn.appendChild(document.createTextNode(record.financial_month));
                valueColumn.appendChild(document.createTextNode(record[elementType]));
                tdCounter.appendChild(document.createTextNode(counter++));
                tr.appendChild(tdCounter);
                tr.appendChild(monthColumn);
                tr.appendChild(valueColumn);
            }
            var textToAppend = humanReadable[elementType] + " for " +
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


function itemForMultiplePeriodForChart(actionableOutput) {
    $.ajax({
        url: "api/v1/financial_data/filtered/multiperiod",
        method: 'GET',
        data: {
            financial_year_id_start: actionableOutput.output.action.year[0],
            financial_year_id_end: actionableOutput.output.action.year[1],
            financial_month_id_start: actionableOutput.output.action.month[0],
            financial_month_id_end: actionableOutput.output.action.month[1],
        },
        success: function (data) {
            console.log(data)
            var elementType = actionableOutput.output.action.element_type;

            // Select notebook and creat table into it
            var newNode = document.createElement('div');
            newNode.className = "output-svg-wrapper";
            var panelTitle = document.createElement('div');
            panelTitle.className = "panel-title-table";
            var barChart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            barChart.setAttribute("class", "d3-barChart")
            
            barChart.setAttribute("height", "300")
            barChart.setAttribute("width", "750")

            newNode.appendChild(barChart);
            notebookElement.appendChild(panelTitle);
            notebookElement.appendChild(newNode);


            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                
                
                var svg = d3.select(barChart),
                margin = {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 40
                },
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom;

            var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
                y = d3.scaleLinear().rangeRound([height, 0]);

            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            x.domain(data.map(function (d) {
                return d.financial_month;
            }));
            y.domain([0, d3.max(data, function (d) {
                return d.passenger_revenue;
            })]);

            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y).ticks(null, "$"))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Value");

            g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    return x(d.financial_month);
                })
                .attr("y", function (d) {
                    return y(d.passenger_revenue);
                })
                .attr("width", x.bandwidth())
                .attr("height", function (d) {
                    return height - y(d.passenger_revenue);
                });
                
                
                
                
                
                
            }




            









//            panelTitle.innerHTML = textToAppend

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




// Create the place holder graph
//var ctx = document.getElementById("myChart").getContext('2d');
//var myChart = new Chart(ctx, {
//    type: 'bar',
//    data: {
//        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
//        datasets: [{
//            label: '# of Votes',
//            data: [12, 19, 3, 5, 2, 3],
//            backgroundColor: [
//                'rgba(255, 99, 132, 0.2)',
//                'rgba(54, 162, 235, 0.2)',
//                'rgba(255, 206, 86, 0.2)',
//                'rgba(75, 192, 192, 0.2)',
//                'rgba(153, 102, 255, 0.2)',
//                'rgba(255, 159, 64, 0.2)'
//            ],
//            borderColor: [
//                'rgba(255,99,132,1)',
//                'rgba(54, 162, 235, 1)',
//                'rgba(255, 206, 86, 1)',
//                'rgba(75, 192, 192, 1)',
//                'rgba(153, 102, 255, 1)',
//                'rgba(255, 159, 64, 1)'
//            ],
//            borderWidth: 1
//        }]
//    },
//    options: {
//        scales: {
//            yAxes: [{
//                ticks: {
//                    beginAtZero:true
//                }
//            }]
//        }
//    }
//});
