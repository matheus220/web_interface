import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, NavLink } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Button, NavItem, Modal } from 'react-bootstrap';
import axios from 'axios';
import ROSLIB from 'roslib';
import DropdownList from 'react-widgets/lib/DropdownList';

import "bootstrap/dist/css/bootstrap.min.css";

import EditTodo from "./components/edit-todo.component";
import Waypoints from "./components/waypoints.component";
import Missions from "./components/missions.component";
import Navigation from "./components/navigation.component";
import CreateWaypoint from "./components/create-waypoint.component";
import CreateMission from "./components/create-mission.component";
import Schedule from "./components/schedule.component";
import Assistance from "./components/assistance.component";
import ViewByDate from "./components/view-by-date.component";

import logo from "./logo.png";

const NoMatch = ({ location }) => (
    <div>
        <h3>No match for <code>{location.pathname}</code></h3>
    </div>
)

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentMode: "UNDEFINED",
            battery: "",
            show: false,
            changeModeTo: "",
            changeToPatrol: "",
            missions: []
        };

        this.handleClose = this.handleClose.bind(this);
        this.requestModeChange = this.requestModeChange.bind(this);

        let robot_IP = process.env.REACT_APP_ROS_MASTER_IP;

        let ros = new ROSLIB.Ros({
            url: "ws://" + robot_IP + ":9090"
        });

        this.currentModeListener = new ROSLIB.Topic({
            ros : ros,
            name : '/current_mode',
            messageType : 'std_msgs/String',
            throttle_rate : 1
        });

        this.batteryListener = new ROSLIB.Topic({
            ros : ros,
            name : '/npb/power_info',
            messageType : 'npb/MsgPowerInfo',
            throttle_rate : 1
        });

        this.changeModePublisher = new ROSLIB.Topic({
            ros : ros,
            name : '/change_mode',
            messageType : 'std_msgs/String',
            throttle_rate : 100
        });

        this.currentModeListener.subscribe(this._mode_callback);
        this.batteryListener.subscribe(this._battery_callback);
        this.changeModePublisher.advertise();
    }

    _mode_callback (currentMode) {
        if (currentMode.data !== this.state.currentMode) {
            this.setState({currentMode: currentMode.data});
            if (currentMode.data === "TELEOPERATION") {
                this.props.history.push('/assistance');
            }
        }
    }

    _battery_callback (level) {
        if (level.batt_soc !== this.state.battery) {
            this.setState({
                battery: level.batt_soc
            });
        }
    }

    componentDidMount() {
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':4000/mission/')
            .then(response => {
                if(response.data.length !== this.state.missions.length) {
                    this.setState({ missions: response.data});
                }
            })
            .catch(function (error){
                console.log(error);
            })
    }

    componentWillUnmount() {
        this.currentModeListener.unsubscribe(this._mode_callback);
        this.batteryListener.unsubscribe(this._battery_callback);
        this.changeModePublisher.unadvertise();
    }
    
    requestModeChange(){
        var stringMessage = new ROSLIB.Message({
            data: ""
        });
        var date = new Date().toISOString();
        
        switch (this.state.changeModeTo) {
            case 'patrol':
                if(this.state.changeToPatrol) {
                    stringMessage.data = "{\"timestamp\": \"" + date + "\", \"mode\": \"patrol\", \"mission_id\": \"" + this.state.changeToPatrol + "\"}"; 
                }
                break;
            case 'assistance':
                stringMessage.data = "{\"timestamp\": \"" + date + "\", \"mode\": \"assistance\"}";
                break;
            case 'recharge':
                stringMessage.data = "{\"timestamp\": \"" + date + "\", \"mode\": \"recharge\"}";
                break;
            case 'stop':
                stringMessage.data = "{\"timestamp\": \"" + date + "\", \"mode\": \"stop\"}";
                break;
            default:
                console.log("No mode chosen")
        }
        if(stringMessage.data !== "") {
            this.changeModePublisher.publish(stringMessage)
            this.handleClose();
        }
    }

    handleClose() {
        this.setState({
            show: false,
            changeModeTo: "",
            changeToPatrol: ""
        });
    }
    
    render() {
        return (
            <Router>
                <div className="pcoded-wrapper">
                    <Navbar bg="dark" variant="dark" expand="lg">
                        <Navbar.Brand href="/">
                            <img
                                alt=""
                                src={logo}
                                width="30"
                                height="30"
                                className="d-inline-block align-top"
                                style={{marginRight: "10px"}}
                            />
                            {' DC Supervision '}
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="mr-auto">
                                <NavItem>
                                    <NavLink exact to="/" className="nav-link" activeClassName="active">Navigation</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink to="/waypoints" className="nav-link">Waypoints</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink to="/missions" className="nav-link">Missions</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink to="/schedule" className="nav-link">Schedule</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink to="/database" className="nav-link">Database</NavLink>
                                </NavItem>
                            </Nav>
                            <Nav>
                                <NavDropdown title="Change mode" id="basic-nav-dropdown">
                                    <NavDropdown.Item onClick={()=>this.setState({show: true, changeModeTo: "patrol"})}>Patrol</NavDropdown.Item>
                                    <NavDropdown.Item onClick={()=>this.setState({show: true, changeModeTo: "assistance"})}>Assistance</NavDropdown.Item>
                                    <NavDropdown.Item onClick={()=>this.setState({show: true, changeModeTo: "recharge"})}>Recharge</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={()=>this.setState({show: true, changeModeTo: "stop"})}>Stop</NavDropdown.Item>
                                </NavDropdown>
                                <Button style={{marginLeft: "10px", borderRadius: "10px"}} variant="light">UNDEFINED</Button>
                                <Button style={{marginLeft: "10px", borderRadius: "10px"}} variant="success">100%</Button>
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar>
                    <Modal show={this.state.show} onHide={this.handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Switch to {this.state.changeModeTo} mode</Modal.Title>
                        </Modal.Header>
                        {this.state.changeModeTo === "patrol" ?
                        <Modal.Body>
                            <DropdownList
                                filter={(item, searchTerm) => item.name.indexOf(searchTerm) > -1}
                                data={this.state.missions}
                                textField='name'
                                valueField='_id'
                                onChange={changeToPatrol => this.setState({changeToPatrol: changeToPatrol._id})}
                                placeholder="Choose the mission to be performed"
                            />
                        </Modal.Body> :
                        null }
                        <Modal.Footer>
                            <Button variant="secondary" onClick={this.requestModeChange}>Yes</Button>
                            <Button variant="primary" onClick={this.handleClose}>No</Button>
                        </Modal.Footer>
                    </Modal>
                    <div className="pcoded-content">
                        <div className="main-bodyt">
                            <div className="page-wrapper">
                                <div className="page-body">
                                    <Switch>
                                        <Route path="/" exact component={Navigation} />
                                        <Route path="/edit/:id" component={EditTodo} />
                                        <Route path="/waypoints" component={Waypoints} />
                                        <Route path="/create_waypoint" component={CreateWaypoint} />
                                        <Route path="/missions" component={Missions} />
                                        <Route path="/create_mission" component={CreateMission} />
                                        <Route path="/schedule" component={Schedule} />
                                        <Route path="/assistance" component={Assistance} />
                                        <Route path="/database" component={ViewByDate} />
                                        <Route component={NoMatch} />
                                    </Switch>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}