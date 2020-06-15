import React,{useState,useEffect} from "react";
import moment from "moment";
import './App.css';

function Column({title,content}) {
    if(!content)return null;
    return <div className='info-col'>
        <div className='info-col-title'>
            {title}
        </div>
        <div className='info-col-content'>
            {content}
        </div>
    </div>
}

export function AVInfo({data,item}) {
    //console.log(data);
    if(!data.length)return null;
    const nowData=data[data.length-1].reduce((pre,cur,index)=>({...pre,[item[index]]:cur}),{});
    const allData=data.map(o=>o.reduce((pre,cur,index)=>({...pre,[item[index]]:cur}),{}));
    //console.log(nowData);
    const getValueAt=(time)=>{
        let i=data.length-1;
        while (time.valueOf()<moment(allData[i]['time']).valueOf()){
            i--;
            if (i<0)return undefined;
        }
        if(i===data.length-1)return undefined;
        let dl=time.valueOf()-moment(allData[i]['time']).valueOf();
        let dr=-time.valueOf()+moment(allData[i+1]['time']).valueOf();
        //console.log(dl,dr,seriesMap['播放'].data[i]);
        return (allData[i+1]['view']*dl+allData[i]['view']*dr)/(dl+dr);
    };
    const getValueBefore=(...duration)=>{
        const time=moment(nowData.time).subtract(...duration);
        return getValueAt(time);
    };
    const getItemAt=(play)=>{
        for(let item of allData){
            if(item.view>=play)return item;
        }
        return undefined;
    };
    return (
        <div className='info'>
            <Column title={'播放数'} content={nowData.view}/>
            <Column title={'收藏率'} content={(nowData.favorite*100/nowData.view).toFixed(2)+"%"}/>
            <Column title={'点赞率'} content={(nowData.like*100/nowData.view).toFixed(2)+"%"}/>
            <Column title={'当前增速'} content={
                getValueBefore(1,'h')?
                    (nowData.view-getValueBefore(1,'h')).toFixed(2)+"/h":undefined
            }/>
            <Column title={'日增'} content={
                getValueBefore(24,'h')?
                    (nowData.view-getValueBefore(24,'h')).toFixed(2):undefined
            }/>
            <Column title={'2K点击收藏'} content={
                (o=>o?o.favorite:undefined)(getItemAt(2000))
            }/>
            <Column title={'首日播放'} content={
                (o=>o?o.toFixed(0):undefined)(getValueAt(moment(allData[0].time).add("24",'h')))
            }/>
        </div>
    )
}