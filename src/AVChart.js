import React from "react";
import Axios from "axios";
import ReactEcharts from "echarts-for-react";
import config from "./config";

class AVChart extends React.Component{
    constructor(...args) {
        super(...args);
        this.state = {option:{}};
        this.interval=0;
    }

    componentDidMount() {
        const fetchAndDisplay=()=> {
            Axios({url: config.apiUrl+(config.apiUrl.endsWith("/")?"":"/")+this.props.av+"?item="+this.props.item.join(","), responseType: "json"}).then(data => {
                    console.log(data.data);
                    const category =this.props.item.map(a=>a);
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
                        dataZoom: [
                            {
                                show: true,
                                realtime: true
                            }
                        ],
                        sort: "none",
                        series: series
                    };
                    this.setState({option: option});
                    console.log(option);
                }
            );
        }
        fetchAndDisplay();
        this.interval=setInterval(fetchAndDisplay,60000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return <div className={"chart"}>
            <ReactEcharts option={this.state.option} style={{height: '100%', width: '100%'}}/>
        </div>;
    }
}

export default AVChart;