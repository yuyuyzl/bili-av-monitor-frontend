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
                            <div>root page</div>
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
        this.state = {monitoring:[]};
        this.interval=0;
    }

    componentDidMount() {
        const fetchAndDisplay=()=> {
            Axios({
                url: config.apiUrl + (config.apiUrl.endsWith("/") ? "" : "/") + "monitor?item=av,title",
                responseType: "json"
            }).then(data => {
                this.setState({monitoring: data.data});
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
                Bilibili AV Monitor
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

export default App;
