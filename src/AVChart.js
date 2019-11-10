import React from "react";
import Axios from "axios";
import ReactEcharts from "echarts-for-react";
import config from "./config";

class AVChart extends React.Component{
    constructor(...args) {
        super(...args);
        this.state = {option:{},data:[],updatedAt:new Date(0)};
        this.interval=0;
    }

    componentDidMount() {
        const fetchAndDisplay=()=> {
            Axios({url: config.apiUrl+(config.apiUrl.endsWith("/")?"":"/")+this.props.av+"?item="+this.props.item.join(",")+"&after="+this.state.updatedAt.toISOString(), responseType: "json"}).then(data => {
                    this.setState((state,props)=>{
                        console.log(data.data);
                        const newData=[...state.data,...data.data.data];
                        const category =props.item.map(a=>a);
                        const categoryTrans={
                            "time":"时间",
                            "like":"喜欢",
                            "favorite":"收藏",
                            "coin":"投币",
                            "view":"播放"
                        };
                        let timeStart = category[0] === 'time';
                        let series;
                        if (timeStart) {
                            category.shift();
                            series = category.map(name => {
                                return {
                                    name: categoryTrans[name],
                                    type: 'line',
                                    showSymbol: false,
                                    hoverAnimation: false,
                                    data: [],
                                    yAxisIndex:name==="view"?0:1,
                                    markLine: {
                                        silent:true,
                                        label:{
                                            formatter: '{c}{b}',
                                        },
                                        symbol:name==="view"?["emptyCircle","none"]:["none","emptyCircle"],
                                        data: [
                                            {type: 'max', name: categoryTrans[name]}
                                        ]
                                    }
                                }
                            });
                            newData.forEach(line => {
                                const time = line[0];
                                line.forEach((data, i) => {if(i!==0)series[i-1].data.push([time, data])});
                            });
                        }else {
                            series=[{
                                name: "Data",
                                type: 'line',
                                showSymbol: false,
                                hoverAnimation: false,
                                data: newData
                            }]
                        }
                        const option = {
                            grid:{
                                bottom: 80
                            },
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    animation: false
                                }
                            },
                            legend: {
                                data: category.map(name=>categoryTrans[name]),
                                orient: "vertical",
                                left:"1%",
                                top:"middle"
                            },
                            yAxis: [{
                                name:"播放",
                                type: 'value'
                            },{
                                name:"其他",
                                type: 'value'
                            }],
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
                        return {
                            option:option,
                            data:newData,
                            updatedAt: new Date(data.data.updatedAt)
                        }
                    });
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
            <div className={"options-buttons"}>
                <a href={"https://www.bilibili.com/video/av"+this.props.av} target="_blank" rel="noopener noreferrer">前往视频</a>
                <a href={"#"}>停(WIP)</a>
                <div className={"icon"}><div className={"iconinner"}>+</div></div>
            </div>
        </div>;
    }
}

export default AVChart;