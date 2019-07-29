import React, { Component } from 'react';
import ImageGallery from 'react-image-gallery';
import ROSLIB from 'roslib';
import DropdownList from 'react-widgets/lib/DropdownList'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import MapWaypoints from "./map.component";
import { Scrollbars } from 'react-custom-scrollbars';
import axios from 'axios';
import "react-image-gallery/styles/css/image-gallery.css";
import 'react-widgets/dist/css/react-widgets.css';
//http://192.168.1.96:8080/stream?topic=/camera/image_raw&type=mjpeg&quality=20
//http://192.168.1.96:8080/stream?topic=/camera2/image2_raw&type=mjpeg&quality=20
//http://192.168.1.96:8080/stream?topic=/camera3/image3_raw&type=mjpeg&quality=20
//http://lorempixel.com/1000/600/nature/1/
export default class Navigation extends Component {
    constructor(props) {
        super(props);
        this.defaultImages = [
            { original: 'http://192.168.1.96:8080/stream?topic=/camera/image_raw&type=mjpeg&quality=20' },
            { original: 'http://192.168.1.96:8080/stream?topic=/camera2/image2_raw&type=mjpeg&quality=20' },
            { original: 'http://192.168.1.96:8080/stream?topic=/camera3/image3_raw&type=mjpeg&quality=20' }
        ]
        this.defaultCameras = ['camera1', 'camera2', 'camera3']

        this.modeMapping = [
            "UNDEFINED",
            "PATROL",
            "TELEOPERATION",
            "SEMI AUTONOMOUS",
            "NOT CHARGING",
            "GOING RECHARGE",
            "DOCKING",
            "DOCKED"
        ]

        this.state = {
            logmission: {},
            map_waypoints: [],
            logs: [],
            images: this.defaultImages,
            cameras: this.defaultCameras,
            waypointName: "",
            current_index: 0,
            timestamp: [],
            real_time: true,
            currentMode: "UNDEFINED",
            battery: "-- ",
            changeModeTo: "",
            changeToPatrol: null,
            missions: []
        };

        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.toggleRealTime = this.toggleRealTime.bind(this);
        this.onSlide = this.onSlide.bind(this);
        this._mode_callback = this._mode_callback.bind(this);
        this._battery_callback = this._battery_callback.bind(this);
        this.changeMode = this.changeMode.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.requestModeChange = this.requestModeChange.bind(this);
        
        let robot_IP = "192.168.1.96";

        let ros = new ROSLIB.Ros({
            url: "ws://" + robot_IP + ":9090"
        });

        let currentModeListener = new ROSLIB.Topic({
            ros : ros,
            name : '/current_mode',
            messageType : 'std_msgs/String',
            throttle_rate : 1
        });

        let batteryListener = new ROSLIB.Topic({
            ros : ros,
            name : '/npb/power_info',
            messageType : 'npb/MsgPowerInfo',
            throttle_rate : 1
        });

        this.changeModePublisher = new ROSLIB.Topic({
            ros : ros,
            name : '/change_mode',
            messageType : 'std_msgs/String',
            throttle_rate : 10
        });

        currentModeListener.subscribe(this._mode_callback);
        batteryListener.subscribe(this._battery_callback);
    }

    _mode_callback (currentMode) {
        if (currentMode.data !== this.state.currentMode) {
            this.setState({
                currentMode: currentMode.data
            });
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
        axios.get('http://localhost:4000/logmission/')
            .then(response => {
                if (response.data !== null) {
                    let mission_waypoints = response.data.mission_id.path;
                    let traveled_waypoints = response.data.data;
                    mission_waypoints.map(waypoint => {
                        let index = traveled_waypoints.findIndex(measure => measure.waypoint._id === waypoint._id);
                        if (index !== -1) {
                            switch (traveled_waypoints[index].status) {
                            case 'succeeded':
                                waypoint.icon = 1;
                                break;
                            case 'active':
                                waypoint.icon = 3;
                                break;
                            case 'aborted':
                                waypoint.icon = 2;
                                break;
                            default:
                                waypoint.icon = 0;
                            }
                            if(traveled_waypoints[index].hasOwnProperty('input')) {
                                waypoint.images = traveled_waypoints[index].input.items.filter(item => {
                                    return(item.model === "Camera")
                                }).map(item => {
                                    return({ "camera_name": item.item.item_name, "image_name": item.item.data.image_name, "path": item.item.data.path, "timestamp": traveled_waypoints[index].input.timestamp});
                                });
                            }
                        }
                        return(waypoint);
                    })
                    this.setState({ logmission: response.data, map_waypoints: mission_waypoints });
                } else {
                    this.setState({ logmission: [], map_waypoints: [] });
                }
                
                
            })
            .catch(function (error){
                console.log(error);
            })
        axios.get('http://localhost:4000/log/')
            .then(response => {
                this.setState({ logs: response.data});
            })
            .catch(function (error){
                console.log(error);
            })
        axios.get('http://localhost:4000/mission/')
            .then(response => {
                this.setState({ missions: response.data});
            })
            .catch(function (error){
                console.log(error);
            })
    }

    componentDidUpdate(){
        axios.get('http://localhost:4000/log/')
            .then(response => {
                if(response.data.length !== this.state.logs.length) {
                    this.setState({ logs: response.data});
                }
            })
            .catch(function (error){
                console.log(error);
            })
    }

    onMarkerClick(e) {
        let waypoint = this.state.map_waypoints.find(wp => wp._id === e.target.options.id);
        if( waypoint.hasOwnProperty('images') ) {
            let images = waypoint.images.map(img => {
                return {original: "/images/" + img.image_name};
            });
            let cameras = waypoint.images.map(img => {
                return img.camera_name;
            });
            let timestamp = waypoint.images.map(img => {
                let date = new Date(Date.parse(img.timestamp));
                return date.toLocaleString();
            });
            this.setState({
                real_time: false,
                images: images,
                cameras: cameras,
                timestamp: timestamp,
                waypointName: waypoint.name
            });
        }
    }

    requestModeChange(){
        var stringMessage = new ROSLIB.Message({
            data: ""
        });
        var date = new Date().toISOString();
        
        switch (this.state.changeModeTo) {
            case 'patrol':
                if(this.state.changeToPatrol) {
                    stringMessage.data = "{\"timestamp\": \"" + date + "\" \"mode\": \"patrol\", \"scheduled\": \"false\", \"mission_id\": \"" + this.state.changeToPatrol + "\"}"; 
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
            this.toggleModal();
        }
        
    }

    changeMode(mode) {
        this.setState(prevState => ({
            modal: !prevState.modal,
            changeModeTo: mode
        }));
    }

    toggleModal() {
        this.setState(prevState => ({
            modal: !prevState.modal,
            changeModeTo: "",
            changeToPatrol: ""
        }));
    }

    toggleRealTime() {
        this.setState({
            real_time: true,
            images: this.defaultImages,
            cameras: this.defaultCameras,
            timestamp: [],
            waypointName: ""
        });
    }

    onSlide(currentIndex) {
        this.setState({
            current_index: currentIndex
        });
    }

    render() {

        let logs = this.state.logs.map((mission, i) => {
            let circle_color = "b-" + mission.levelname.toLowerCase() + " update-icon ring";
            let text_color = "t-" + mission.levelname.toLowerCase();
            let date = new Date(Date.parse(mission.date));
            return (
                <div className="row p-t-15 p-b-15" key={i}>
                    <div className="col-auto text-right update-meta p-r-0">
                        <i className={circle_color}></i>
                    </div>
                    <div className="col p-l-5" style={{width: "100%"}}>
                        <h6><strong className={text_color}>{mission.levelname}</strong> | {date.toLocaleString()}</h6>
                        <p className="text-muted m-b-0">
                            {mission.message}
                        </p>
                    </div>
                </div>
            );
        });

        let has_mission = this.state.map_waypoints.length !== 0;
        let mission_time_info = "";
        let title = "";
        if (has_mission) {
            if (this.state.logmission.hasOwnProperty('end_time')) {
                let date = new Date(Date.parse(this.state.logmission.end_time));
                mission_time_info = "Finished at " + date.toLocaleTimeString();
                title = "Last mission";
            } else {
                let date = new Date(Date.parse(this.state.logmission.start_time));
                mission_time_info = "Started at " + date.toLocaleTimeString();
                title = "Current mission";
            }
        }

        let critical_battery = this.state.battery < 30;

        return (
            <div className="row">
                <div className="currentState">
                    <button type="button" className="btn btn-light">{this.state.currentMode}</button>
                    {critical_battery ? 
                        <button type="button" className="btn btn-danger">{this.state.battery}%</button> :
                        <button type="button" className="btn btn-success">{this.state.battery}%</button>
                    }
                    
                </div>
                <div className="col-md-12 col-xl-6">
                    <div className="card">
                        {has_mission ? 
                        <div className="card-header">
                            <h5>{title}</h5>
                            <div className="card-header-right-text">
                                {this.state.logmission.mission_id ? <strong>Mission {this.state.logmission.mission_id.name}</strong> : ""}<br/>
                                {mission_time_info}
                            </div>
                        </div> :
                        <div className="card-header">
                            <h5>No missions performed</h5>
                        </div>
                        }
                        <div className="card-block" style={{paddingTop: "5px"}}>
                            <MapWaypoints waypoints={this.state.map_waypoints} robotPose={true} onMarkerClick={this.onMarkerClick} showPath={true} height={"80.9vh"}/>
                        </div>
                    </div>
                    <div className="card" style={{marginTop: "20px"}}>
                        <div className="card-header">
                            <h5>Change mode</h5>
                        </div>
                        <div className="card-block change-mode-card" style={{paddingTop: "5px"}}>
                            <div className="d-flex justify-content-between">
                                <button type="button" className="btn btn-primary" onClick={()=>this.changeMode("patrol")}>Patrol</button>
                                <button type="button" className="btn btn-warning" onClick={()=>this.changeMode("assistance")}>Assistance</button>
                                <button type="button" className="btn btn-success" onClick={()=>this.changeMode("recharge")}>Recharge</button>
                                <button type="button" className="btn btn-danger" onClick={()=>this.changeMode("stop")}>Stop</button>
                            </div>
                        </div>
                    </div>
                    <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                        <ModalHeader toggle={this.toggle}>Switch to {this.state.changeModeTo} mode</ModalHeader>
                        {this.state.changeModeTo === "patrol" ?
                        <ModalBody>
                            <DropdownList
                                filter={(item, searchTerm) => item.name.indexOf(searchTerm) > -1}
                                data={this.state.missions}
                                textField='name'
                                valueField='_id'
                                onChange={changeToPatrol => this.setState({changeToPatrol: changeToPatrol._id})}
                                placeholder="Choose the mission to be performed"
                            />
                        </ModalBody> :
                        null }
                        <ModalFooter>
                            <Button color="primary" onClick={this.requestModeChange}>Yes</Button>{' '}
                            <Button color="secondary" onClick={this.toggleModal}>No</Button>
                        </ModalFooter>
                    </Modal>
                </div>
                <div  className="col-md-12 col-xl-6">
                    <div className="card">
                        {this.state.real_time ?
                        <div className="card-header">
                            <h5>{this.state.cameras[this.state.current_index]}</h5>
                            <div className="card-header-right-text" style={{paddingTop: "7px"}}>
                                <button type="button" className="btn btn-success">REAL-TIME</button>
                            </div>
                        </div> :
                        <div className="card-header">
                            <h5>{this.state.cameras[this.state.current_index]}  | </h5><span style={{color: '#7e7e7e', fontSize:"0.9em"}}>Waypoint {this.state.waypointName}</span><br/>
                            <span className="caption-text">Photo taken at {this.state.timestamp[this.state.current_index]}</span>
                            <div className="card-header-right-text" style={{paddingTop: "0px"}}>
                                <button type="button" onClick={this.toggleRealTime} className="btn btn-secondary">REAL-TIME</button>
                            </div>
                        </div>
                        }
                        <div className="card-block" style={{paddingTop: "5px", minHeight: "400px"}}>
                            <ImageGallery onSlide={this.onSlide} defaultImage={"/error.jpg"} items={this.state.images} lazyLoad={false} showThumbnails={false} showPlayButton={false} showBullets={true}/>
                        </div>
                    </div>
                    <div className="card latest-update-card" style={{marginTop: "20px"}}>
                        <div className="card-header">
                            <h5>Latest Activity</h5>
                        </div>
                        <div className="card-block" style={{paddingTop: "0px"}}>
                            {logs.length ?
                            <Scrollbars autoHide style={{ width: "auto", height: "220px" }}>
                                <div className="latest-update-box">
                                    {logs}
                                </div>
                            </Scrollbars> :
                            <h4 style={{textAlign: "center", marginTop: "10px", color: "rgb(205, 205, 205)"}}>No log found</h4>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}