import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, NavLink, Redirect } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Button, NavItem, Modal } from 'react-bootstrap';
import axios from 'axios';
import ROSLIB from 'roslib';
import DropdownList from 'react-widgets/lib/DropdownList';

import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../actions/authActions";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

import Waypoints from "./waypoints.component";
import Missions from "./missions.component";
import Navigation from "./navigation.component";
import CreateWaypoint from "./create-waypoint.component";
import CreateMission from "./create-mission.component";
import Schedule from "./schedule.component";
import Assistance from "./assistance.component";
import ViewByDate from "./view-by-date.component";
import MissionEdit from "./mission-edit.component";
import WaypointEdit from "./waypoint-edit.component";

import { ROSProvider } from './ROSContext'

import logo from "./../logo.png";

const NoMatch = ({ location }) => (
    <div className="row">
        <div className="col-md-12 col-xl-12">
            <div className="card d-flex justify-content-center" style={{height: "80vh"}}>
                <div style={{margin: "auto", textAlign:"center"}}>
                    <h2>ERROR 404</h2><br/>
                    <h3>PAGE NOT FOUND (<code>{location.pathname}</code>)</h3>
                </div>
            </div>
        </div>
    </div>
)

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null, errorInfo: null };
    }
    
    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error: error,
            errorInfo: errorInfo
        })
        // You can also log error messages to an error reporting service here
    }
    
    render() {
        if (this.state.errorInfo) {
            // Error path
            return (
                <div className="row">
                    <div className="col-md-12 col-xl-12">
                        <div className="card d-flex justify-content-center" style={{height: "80vh"}}>
                            <div style={{margin: "auto", textAlign:"center"}}>
                                <h2>Something went wrong</h2><br/>
                                <h3>Please refresh the page</h3>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        // Normally, just render children
        return this.props.children;
    }  
}

class AuthenticatedApp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentMode: "UNDEFINED",
            battery: "--",
            show: false,
            changeModeTo: "",
            changeToPatrol: "",
            missions: [],
            redirect: false
        };

        this.handleClose = this.handleClose.bind(this);
        this.requestModeChange = this.requestModeChange.bind(this);
        this._mode_callback = this._mode_callback.bind(this);
        this._battery_callback = this._battery_callback.bind(this);
        this.renderRedirect = this.renderRedirect.bind(this);

        this.ros = new ROSLIB.Ros({
            url: "ws://" + process.env.REACT_APP_ROS_MASTER_IP + ":9090"
        });

        this.currentModeListener = new ROSLIB.Topic({
            ros : this.ros,
            name : '/current_mode',
            messageType : 'std_msgs/String',
            throttle_rate : 1
        });

        this.batteryListener = new ROSLIB.Topic({
            ros : this.ros,
            name : '/npb/power_info',
            messageType : 'npb/MsgPowerInfo',
            throttle_rate : 1
        });

        this.changeModePublisher = new ROSLIB.Topic({
            ros : this.ros,
            name : '/change_mode',
            messageType : 'std_msgs/String',
            throttle_rate : 100
        });

        this.currentModeListener.subscribe(this._mode_callback);
        this.batteryListener.subscribe(this._battery_callback);
        this.changeModePublisher.advertise();
    }

    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };

    _mode_callback (currentMode) {
        if (currentMode.data !== this.state.currentMode) {
            this.setState({currentMode: currentMode.data});
            if (currentMode.data === "TELEOPERATION") {
                this.setState({redirect: true});
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
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':'+process.env.REACT_APP_SERVER_PORT+'/api/mission/')
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

    renderRedirect = () => {
        if (this.state.redirect) {
        this.setState({redirect: false});
          return <Redirect to='/assistance' />
        }
    }
    
    render() {
        var on_assistance = this.state.currentMode === 'TELEOPERATION';
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
                                {on_assistance ?
                                <NavItem>
                                    <NavLink to="/assistance" className="nav-link" activeClassName="active">Assistance</NavLink>
                                </NavItem> :
                                null }
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
                                <Button style={{marginLeft: "10px", borderRadius: "10px"}} variant="light">{this.state.currentMode}</Button>
                                <Button style={{marginLeft: "10px", borderRadius: "10px"}} variant="success">{this.state.battery}%</Button>
                                <Button style={{marginLeft: "10px", borderRadius: "10px"}} variant="light" onClick={this.onLogoutClick}><FontAwesomeIcon icon={faSignOutAlt} /></Button>
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
                            <Button variant="secondary" onClick={this.handleClose}>No</Button>
                            <Button variant="primary" onClick={this.requestModeChange}>Yes</Button>
                        </Modal.Footer>
                    </Modal>
                    <div className="pcoded-content">
                        <div className="main-bodyt">
                            <div className="page-wrapper">
                                <div className="page-body">
                                    {this.renderRedirect()}
                                    <ErrorBoundary>
                                        <ROSProvider value={this.ros}>
                                            <Switch>
                                                <Route path="/login" exact render={() => (<Redirect to="/" />)} />
                                                <Route path="/" exact component={Navigation} />
                                                <Route path="/waypoints" component={Waypoints} />
                                                <Route path="/create_waypoint" component={CreateWaypoint} />
                                                <Route path="/waypoint-edit/:id" component={WaypointEdit} />
                                                <Route path="/missions" component={Missions} />
                                                <Route path="/create_mission" component={CreateMission} />
                                                <Route path="/mission-edit/:id" component={MissionEdit} />
                                                <Route path="/schedule" component={Schedule} />
                                                <Route path="/assistance" component={Assistance} />
                                                <Route path="/database" component={ViewByDate} />
                                                <Route component={NoMatch} />
                                            </Switch>
                                        </ROSProvider>
                                    </ErrorBoundary>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}

AuthenticatedApp.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
  };
  
  const mapStateToProps = state => ({
    auth: state.auth
  });
  
  export default connect(
    mapStateToProps,
    { logoutUser }
  )(AuthenticatedApp);
  