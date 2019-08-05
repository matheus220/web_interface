import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Scrollbars } from 'react-custom-scrollbars';
import axios from 'axios';
import MapWaypoints from "./map.component";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTimes, faPen } from '@fortawesome/free-solid-svg-icons'
import './style-list-waypoints.css';

export default class Waypoints extends Component {

    constructor(props) {
        super(props);
        this.state = {waypoints: [], search: '', selectedWaypoint: ''};

        this.updateSearch = this.updateSearch.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.select = this.select.bind(this);
        this.onMarkerClick = this.onMarkerClick.bind(this);
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

    select(e) {
        if(this.state.selectedWaypoint === e._id) {
            this.setState({
                selectedWaypoint: ''
            });
        } else {
            this.setState({
                selectedWaypoint: e._id
            });
        }
    }

    onMarkerClick(e) {
        this.setState({selectedWaypoint: e.target.options.id, search: e.target.options.name});
    }

    render() {

        let filtered = this.state.waypoints.filter(
            (wp) => {
                let name = wp.name.toLowerCase();
                if (wp._id === this.state.selectedWaypoint) {
                    wp.icon = 8;
                    wp.showOrientation = true;
                } else {
                    wp.icon = 0;
                    wp.showOrientation = false;
                }
                return name.indexOf(this.state.search.toLowerCase()) !== -1;
            }
        );
        let filtered_sorted = filtered.sort((wp1, wp2) => (wp1.name.toLowerCase() > wp2.name.toLowerCase()) ? 1 : -1);
        let waypoint = filtered_sorted.map(wp =>
            <List key={wp._id} item={wp} selected={this.state.selectedWaypoint === wp._id ? true : false} onItemClick={this.deleteItem} onItemClick2={this.select} />
        );

        return (
            <div className="row">
                <div className="col-md-12 col-xl-9">
                    <div className="card">
                        <div className="card-block">
                            <MapWaypoints waypoints={filtered} onMarkerClick={this.onMarkerClick} showPopup={false} showPath={false} />
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-3 d-flex" style={{minHeight: "500px"}}>
                    <div className="card flex-grow-1">
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div className="col-6 col-sm-6" style={{paddingLeft: "0px"}}>
                                <h5>Waypoints</h5>
                            </div>
                            <div className="col-6 col-sm-6 d-flex justify-content-end" style={{paddingRight: "0px"}}>
                                <Link to="/create_waypoint">
                                    <button type="button" className="btn btn-success">
                                        <FontAwesomeIcon icon={faPlus} />
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
        this.state = {
            isMouseInside: false
        }
        this.mouseEnter = this.mouseEnter.bind(this);
        this.mouseLeave = this.mouseLeave.bind(this);
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

    mouseEnter = () => {
        this.setState({ isMouseInside: true });
    }

    mouseLeave = () => {
        this.setState({ isMouseInside: false });
    }

    render() {
        let classes = "col text li-missions flex-grow-1" + (this.props.selected ? " selected" : "");
        return (
            <li key={this.props.item._id} className="li-list" onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
                <div className="d-flex align-items-center justify-content-between" style={{width: "100%"}}>
                    <div className={classes}  onClick={this._onClick2}>{this.props.item.name}</div>
                    {(this.props.selected || this.state.isMouseInside) ? 
                    <div>
                        <Link to={"/waypoint-edit/"+this.props.item._id}>
                            <button type="button" className="btn btn-info" style={{margin: "auto 1px", fontSize: "1.05em"}}><FontAwesomeIcon icon={faPen} /></button>
                        </Link>
                        <button type="button" onClick={this._onClick} className="btn btn-danger" style={{margin: "auto 1px", fontSize: "1.05em"}}><FontAwesomeIcon icon={faTimes}/></button>
                    </div>
                    : null}
                </div>
            </li>
        );
    }
}