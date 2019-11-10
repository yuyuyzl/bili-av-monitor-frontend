import React from 'react';
import Axios from "axios";
import './App.css';
import AVChart from "./AVChart";
import { BrowserRouter, Route, Link,NavLink } from "react-router-dom";
import config from "./config";

class App extends React.Component {


    render() {
        return (
            <div className="App">
                <BrowserRouter>
                    <Sider/>
                    <div className={"main"}>
                        <Route path='/' exact>
                            <div className={"root"}>
                                <h1>Bilibili AV Monitor</h1>
                                <h3>OB yourself.</h3>
                            </div>
                        </Route>
                        <Route path="/admin">
                            <AdminPage
                                title={"添加/修改视频监视"}
                                args={["secret","av","interval","expireDate","title"]}
                                labels={["访问密码","AV号","检测间隔","过期时间","标题"]}
                                action={"av"}
                            />
                        </Route>
                        <Route path='/av/:aid' render={(route)=>{
                            return <AVChart key={route.match.params.aid} av={route.match.params.aid} item={["time","view","like","favorite","coin"]}/>
                        }}/>
                    </div>
                </BrowserRouter>
            </div>
        )
    }
}

class Sider extends React.Component{
    constructor(...args) {
        super(...args);
        this.state = {monitoring:[],updatedAt:new Date(0)};
        this.interval=0;
    }

    componentDidMount() {
        const fetchAndDisplay=()=> {
            Axios({
                url: config.apiUrl + (config.apiUrl.endsWith("/") ? "" : "/") + "monitor?item=av,title&after="+this.state.updatedAt.toISOString(),
                responseType: "json"
            }).then(data => {
                //this.setState({monitoring: data.data.data,updatedAt:new Date(data.data.updatedAt)});
                this.setState((state,props)=>{
                    return {
                        monitoring: [...data.data.data,...state.monitoring].filter((item,k,arr)=>{
                            let res=true;
                            for(let i=0;i<k;i++)res=res&&item[0]!==arr[i][0];
                            return res;
                        }),
                        updatedAt:new Date(data.data.updatedAt)
                    }
                });
            })
        }
        fetchAndDisplay();
        this.interval=setInterval(fetchAndDisplay,60000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        let navItems=this.state.monitoring.map(av=>
            <NavLink to={"/av/"+av[0]} key={av[0]} activeClassName="selected" title={av[1]+" AV"+av[0]}>
                {av[1]+" AV"+av[0]}
            </NavLink>
        );
        return <nav className={"sider"}>
            <header>
                <span>Bilibili AV Monitor</span>
            </header>
            <div className={"sidermain"}>
                <NavLink to="/" exact activeClassName="selected">
                    首页
                </NavLink>
                {navItems}
            </div>
        </nav>;
    }

}

class AdminPage extends React.Component{
    constructor(...args){
        super(...args);
        this.state={};
        //this.props.args.forEach(a=>this.state[a]="");
    }
    render() {
        const inputs=this.props.args.map((a,i)=>
            <input
                key={a}
                placeholder={this.props.labels?this.props.labels[i]:a}
                onChange={event => this.setState({[a]:event.target.value})}
            />
        );
        return <div className={"admin"}>
            <h2>{this.props.title}</h2>
            {inputs}
            <button onClick={async event => {
                const button=event.target;
                button.disabled="disabled";
                const q={};
                this.props.args.forEach(a=>{if(this.state[a])q[a]=this.state[a]});
                q.action=this.props.action;
                console.log(q);
                try {
                    console.log(await Axios({
                        method:"get",
                        url:(config.apiUrl + (config.apiUrl.endsWith("/") ? "" : "/") + "action"),
                        params: q
                    }));
                }catch (e) {
                    alert(e)
                }
                button.disabled="";
            }}>提交</button>
        </div>
    }
}

export default App;
