import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Scrollbars } from 'react-custom-scrollbars';
import axios from 'axios';
import MapWaypoints from "./map.component";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTimes, faPen } from '@fortawesome/free-solid-svg-icons'
import './style-list-waypoints.css';

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
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':'+process.env.REACT_APP_SERVER_PORT+'/api/mission/')
            .then(response => {
                this.setState({ missions: response.data });
            })
            .catch(function (error){
                console.log(error);
            })
    }

    componentDidUpdate() {
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':'+process.env.REACT_APP_SERVER_PORT+'/api/mission/')
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
        axios.post('http://'+process.env.REACT_APP_SERVER_PATH+':'+process.env.REACT_APP_SERVER_PORT+'/api/mission/delete/' + id)
            .then(response => {
                this.setState({
                    missions: this.state.missions.filter(mission => mission._id !== id)
                });
                if(this.state.selected_mission._id === id) {
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
        if(this.state.selected_mission._id === e._id) {
            this.setState({
                selected_mission: { _id: '', name: '', path: [] }
            });
        } else {
            e.path[0].icon = 1;
            this.setState({
                selected_mission: e
            });
        }
    }

    render() {

        let filtered = this.state.missions.filter(
            (mission) => {
                let name = mission.name.toLowerCase();
                return name.indexOf(this.state.search.toLowerCase()) !== -1;
            }
        );

        let filtered_sorted = filtered.sort((m1, m2) => (m1.name.toLowerCase() > m2.name.toLowerCase()) ? 1 : -1);

        let missions = filtered_sorted.map(mission =>
            <List key={mission._id} item={mission} selected={this.state.selected_mission._id === mission._id ? true : false} onItemClick={this.deleteItem} onItemClick2={this.select} />
        );

        return (
            <div className="row">
                <div className="col-md-12 col-xl-9">
                    <div className="card">
                        <div className="card-block">
                            <MapWaypoints waypoints={this.state.selected_mission.path} showPopup={true} showPath={true} />
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-3 d-flex" style={{minHeight: "500px"}}>
                    <div className="card flex-grow-1">
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div className="col-6 col-sm-6" style={{paddingLeft: "0px"}}>
                                <h5>Missions</h5>
                            </div>
                            <div className="col-6 col-sm-6 d-flex justify-content-end" style={{paddingRight: "0px"}}>
                                <Link to="/create_mission">
                                    <button type="button" className="btn btn-success">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="card-block flex-grow-1 listItems" style={{paddingTop: 0 + 'px'}}>
                            <div className="d-flex flex-column" style={{height: "100%"}}>
                                <input type="text" className="input-todo" placeholder="Search Mission" onChange={this.updateSearch} value={this.state.search} />
                                <div className="flex-grow-1">
                                    <Scrollbars autoHide style={{ width: "100%", height: "100%" }}>
                                    {missions.length ? 
                                        <ul>
                                            {missions}
                                        </ul> : <h4 style={{textAlign: "center", marginTop: "10px", color: "#cdcdcd"}}>No Mission found</h4>}
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
                        <Link to={"/mission-edit/"+this.props.item._id}>
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