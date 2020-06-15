import React from "react";
import Axios from "axios";
import ReactEcharts from "echarts-for-react";
import config from "./config";
import moment from "moment";
import {AVInfo} from "./AVInfo";

class AVChart extends React.Component{
    constructor(...args) {
        super(...args);
        this.state = {option:{},data:[],updatedAt:new Date(0)};
        this.interval=0;
    }

    componentDidMount() {
        const fetchAndDisplay=()=> {
            Axios({url: config.apiUrl+(config.apiUrl.endsWith("/")?"":"/")+this.props.bvid+"?item="+this.props.item.join(",")+"&after="+this.state.updatedAt.toISOString(), responseType: "json"}).then(data => {
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
                                },
                                formatter: (params)=> {
                                    //console.log(params);
                                    const paramsMap=Object.fromEntries(params.map(o=>[o.seriesName,o]));
                                    //console.log(series);
                                    const seriesMap=Object.fromEntries(series.map(o=>[o.name,o]));
                                    //console.log(seriesMap['播放'].data[paramsMap['播放'].dataIndex]);
                                    const getValueBefore=(...duration)=>{
                                        const time=moment(params[0].axisValue).subtract(...duration);
                                        let i=paramsMap['播放'].dataIndex;
                                        while (time.valueOf()<moment(seriesMap['播放'].data[i][0]).valueOf()){
                                            i--;
                                            if (i<0)return undefined;
                                        }
                                        let dl=time.valueOf()-moment(seriesMap['播放'].data[i][0]).valueOf();
                                        let dr=-time.valueOf()+moment(seriesMap['播放'].data[i+1][0]).valueOf();
                                        //console.log(dl,dr,seriesMap['播放'].data[i]);
                                        return (seriesMap['播放'].data[i+1][1]*dl+seriesMap['播放'].data[i][1]*dr)/(dl+dr);
                                    };
                                    return `
<b>${moment(params[0].axisValue).format("H:mm:ss MM-DD")}</b> ${moment(params[0].axisValue).fromNow()}
<br>
${params.map(o=>`${o.data[1]}${o.seriesName}`).join(" / ")}
<br>
收藏率 ${(paramsMap['收藏'].data[1]*100/paramsMap['播放'].data[1]).toFixed(2)}%
<br>
${[[600,"10m"],[60*60,"1h"],[60*60*24,"24h"]].map(t=>{
    const ans=((paramsMap['播放'].data[1]-getValueBefore(t[0],'s'))*60*60/t[0]).toFixed(2);
    return ans==="NaN"?undefined:`${t[1]}增速 ${ans}/h`;
}).filter(o=>o).join('<br>')}
`
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
            <AVInfo data={this.state.data} item={this.props.item}/>
            <ReactEcharts option={this.state.option} className='echart'/>
            <div className={"options-buttons"}>
                <a href={"https://www.bilibili.com/video/"+this.props.bvid} target="_blank" rel="noopener noreferrer">前往视频</a>
                <div className={"icon"}><div className={"iconinner"}>+</div></div>
            </div>
        </div>;
    }
}

export default AVChart;