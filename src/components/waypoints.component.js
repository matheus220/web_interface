import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Scrollbars } from 'react-custom-scrollbars';
import axios from 'axios';
import MapWaypoints from "./map.component";
import './style-list-waypoints.css';

export default class Waypoints extends Component {

    constructor(props) {
        super(props);
        this.state = {waypoints: [], search: ''};

        this.updateSearch = this.updateSearch.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
    }

    updateSearch(e) {
        this.setState({ search: e.target.value });
    }

    componentDidMount() {
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':4000/waypoint/')
            .then(response => {
                this.setState({ waypoints: response.data });
            })
            .catch(function (error){
                console.log(error);
            })
    }

    componentDidUpdate() {
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':4000/waypoint/')
            .then(response => {
                if (this.state.waypoints.length !== response.data.length) {
                    this.setState({ waypoints: response.data });
                }
            })
            .catch(function (error){
                console.log(error);
            })
    }

    deleteItem(id) {
        axios.post('http://'+process.env.REACT_APP_SERVER_PATH+':4000/waypoint/delete/' + id)
            .then(response => {
                this.setState({
                    waypoints: this.state.waypoints.filter(wp => wp._id !== id)
                });
            })
            .catch(function (error){
                console.log(error);
            })        
    }

    render() {

        let filtered = this.state.waypoints.filter(
            (wp) => {
                return wp.name.indexOf(this.state.search) !== -1;
            }
        );
        let filtered_sorted = filtered.sort((wp1, wp2) => (wp1.name > wp2.name) ? 1 : -1);
        let waypoint = filtered_sorted.map(wp =>
            <List key={wp._id} item={wp} onItemClick={this.deleteItem} />
        );

        return (
            <div className="row">
                <div className="col-md-12 col-xl-9">
                    <div className="card">
                        <div className="card-block">
                            <MapWaypoints waypoints={filtered} showPopup={true} showPath={false} />
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-3 d-flex" style={{minHeight: "500px"}}>
                    <div className="card flex-grow-1">
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div class="col-6 col-sm-6" style={{paddingLeft: "0px"}}>
                                <h5>Waypoints</h5>
                            </div>
                            <div class="col-6 col-sm-6 d-flex justify-content-end" style={{paddingRight: "0px"}}>
                                <Link to="/create_waypoint">
                                    <button type="button" className="btn btn-success">
                                        +
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="card-block flex-grow-1 listItems" style={{paddingTop: 0 + 'px'}}>
                            <div className="d-flex flex-column" style={{height: "100%"}}>
                                <input type="text" className="input-todo" placeholder="Search Waypoint" onChange={this.updateSearch} value={this.state.search} />
                                <div className="flex-grow-1">
                                    <Scrollbars autoHide style={{ width: "100%", height: "100%" }}>
                                        {waypoint.length ? 
                                        <ul>
                                            {waypoint}
                                        </ul> : <h4 style={{textAlign: "center", marginTop: "10px", color: "#cdcdcd"}}>No Waypoint found</h4>}
                                    </Scrollbars>
                                </div>
                            </div>
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
    }

    _onClick() {
        this.props.onItemClick(this.props.item._id);
    }

    render() {
        return (
            <li key={this.props.item._id} className="li-list">
                <div className="text">{this.props.item.name}</div>
                <button type="button" onClick={this._onClick} className="btn btn-danger" style={{margin: "0px", fontSize: "1.1em"}}>-</button>
            </li>
        );
    }
}