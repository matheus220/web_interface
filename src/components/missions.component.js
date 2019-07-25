import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Scrollbars } from 'react-custom-scrollbars';
import axios from 'axios';
import MapWaypoints from "./map.component";
import './style-list-waypoints.css';

const style = { position: "relative", width: "auto", overflow: "hidden"}

export default class Missions extends Component {

    constructor(props) {
        super(props);
        this.state = {
            missions: [], 
            search: '',
            selected_mission: { _id: '', name: '', path: [] }
        };

        this.updateSearch = this.updateSearch.bind(this);
        this.select = this.select.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
    }

    updateSearch(e) {
        this.setState({ search: e.target.value });
    }

    componentDidMount() {
        axios.get('http://localhost:4000/mission/')
            .then(response => {
                this.setState({ missions: response.data });
            })
            .catch(function (error){
                console.log(error);
            })
    }

    componentDidUpdate() {
        axios.get('http://localhost:4000/mission/')
            .then(response => {
                if (this.state.missions.length !== response.data.length) {
                    this.setState({ missions: response.data });
                }
            })
            .catch(function (error){
                console.log(error);
            })
    }

    deleteItem(id) {
        axios.post('http://localhost:4000/mission/delete/' + id)
            .then(response => {
                this.setState({
                    missions: this.state.missions.filter(mission => mission._id !== id)
                });
                if(this.state.selected_mission._id == id) {
                    this.setState({
                        selected_mission: { id: '', name: '', path: [] }
                    });
                }
            })
            .catch(function (error){
                console.log(error);
            })        
    }

    select(e) {
        if(this.state.selected_mission._id == e._id) {
            this.setState({
                selected_mission: { _id: '', name: '', path: [] }
            });
        } else {
            console.log(e);
            e.path[0].icon = 1;
            this.setState({
                selected_mission: e
            });
        }
        
    }

    render() {

        let filtered = this.state.missions.filter(
            (mission) => {
                return mission.name.indexOf(this.state.search) !== -1;
            }
        );

        let filtered_sorted = filtered.sort((m1, m2) => (m1.name > m2.name) ? 1 : -1);

        let missions = filtered.map(mission =>
            <List key={mission._id} item={mission} selected={this.state.selected_mission._id == mission._id ? true : false} onItemClick={this.deleteItem} onItemClick2={this.select} />
        );

        return (
            <div class="row">
                <div class="col-md-12 col-xl-9">
                    <div className="card">
                        <div className="card-block">
                            <MapWaypoints waypoints={this.state.selected_mission.path} showPath={true} />
                        </div>
                    </div>
                </div>
                <div  class="col-md-12 col-xl-3">
                    <div className="card">
                    <div className="card-header">
                            <h5>Missions</h5>
                            <div className="card-header-right">
                                <Link to="/create_mission">
                                    <button type="button" className="btn btn-success">
                                        +
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="card-block" style={{paddingTop: 0 + 'px'}}>
                            <input type="text" className="input-todo" placeholder="Search Mission" onChange={this.updateSearch} value={this.state.search} />
                            <Scrollbars autoHide style={{ width: "100%", height: "65.5vh" }}>
                            {missions.length ? 
                                <ul>
                                    {missions}
                                </ul> : <h4 style={{textAlign: "center", marginTop: "10px", color: "#cdcdcd"}}>No Mission found</h4>}
                            </Scrollbars>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}          
                        
class List extends Component {

    constructor(props) {
        super(props);
        this._onClick = this._onClick.bind(this);
        this._onClick2 = this._onClick2.bind(this);
    }

    _onClick() {
        if(typeof this.props.onItemClick === "function") {
            this.props.onItemClick(this.props.item._id);
        }
    }

    _onClick2() {
        if(typeof this.props.onItemClick2 === "function") {
            this.props.onItemClick2(this.props.item);
        }
    }

    render() {
        let classes = "col text li-missions" + (this.props.selected ? " selected" : "");
        console.log(classes);
        return (
            <li key={this.props.item._id} className="li-list">
                <div className={classes}  onClick={this._onClick2}>{this.props.item.name}</div>
                <button type="button" onClick={this._onClick} className="btn btn-danger" style={{margin: "0px 1px 0px 0px", fontSize: "1.1em"}}>-</button>
            </li>
        );
    }
}