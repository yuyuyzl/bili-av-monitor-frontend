import React from 'react';
import './App.css';
import Axios from "axios";
import ReactEcharts from "echarts-for-react";

class App extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {};
    }

    componentDidMount() {
        const fetchAndDisplay=()=> {
            const url = new URL(window.location.href);
            Axios({url: url.protocol+"//" + url.pathname + url.search, responseType: "json"}).then(data => {
                    console.log(data.data);
                    const category = url.search.match(/item=([^&]+)/).pop().split(",");
                    let timeStart = category[0] === 'time';
                    let series;
                    if (timeStart) {
                        category.shift();
                        series = category.map(name => {
                            return {
                                name: name,
                                type: 'line',
                                showSymbol: false,
                                hoverAnimation: false,
                                data: []
                            }
                        });
                        data.data.forEach(line => {
                            const time = line.shift();
                            line.forEach((data, i) => series[i].data.push([time, data]));
                        });
                    }else {
                        series=[{
                            name: "Data",
                            type: 'line',
                            showSymbol: false,
                            hoverAnimation: false,
                            data: data.data
                        }]
                    }
                    const option = {
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                animation: false
                            }
                        },
                        yAxis: {
                            type: 'value'
                        },
                        xAxis: {
                            type: timeStart?'time':"value"
                        },
                        sort: "none",
                        series: series
                    };
                    this.setState({option: option});
                    console.log(option);
                }
            );
        }
        fetchAndDisplay();
        setInterval(fetchAndDisplay,60000);
    }

    render() {
        return (
            <div className="App">
                {this.state.option ? (
                    <ReactEcharts option={this.state.option} style={{height: '100%', width: '100%'}}/>) : null}
            </div>
        )
    }
}

export default App;
