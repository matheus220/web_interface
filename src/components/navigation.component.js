import React, { Component } from 'react';
import ImageGallery from 'react-image-gallery';
import ROSLIB from 'roslib';
import MapWaypoints from "./map.component";
import { Scrollbars } from 'react-custom-scrollbars';
import axios from 'axios';
import "react-image-gallery/styles/css/image-gallery.css";
//http://192.168.1.96:8080/stream?topic=/camera/image_raw&type=mjpeg&quality=20
//http://192.168.1.96:8080/stream?topic=/camera2/image2_raw&type=mjpeg&quality=20
//http://192.168.1.96:8080/stream?topic=/camera3/image3_raw&type=mjpeg&quality=20
//http://lorempixel.com/1000/600/nature/1/
export default class Navigation extends Component {
    constructor(props) {
        super(props);
        this.defaultImages = [
            { original: '/image1.jpg' },
            { original: '/image2.jpg' },
            { original: '/image3.jpg' }
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
            currentMode: 0
        };

        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.toggleRealTime = this.toggleRealTime.bind(this);
        this.onSlide = this.onSlide.bind(this);
        this._mode_callback = this._mode_callback.bind(this);
        
        let robot_IP = "192.168.1.96";

        let ros = new ROSLIB.Ros({
            url: "ws://" + robot_IP + ":9090"
        });

        let currentModeListener = new ROSLIB.Topic({
            ros : ros,
            name : '/current_mode',
            messageType : 'Int8',
            throttle_rate : 100
        });

        currentModeListener.subscribe(this._mode_callback);
    }

    _mode_callback (currentMode) {
        if (currentMode !== this.state.currentMode) {
            this.setState({
                currentMode: currentMode
            });
        }
    }
    
    componentDidMount() {
        axios.get('http://localhost:4000/logmission/')
            .then(response => {
                if(response.data.hasOwnProperty('mode')) {
                    let mission_waypoints = response.data.mission_id.path;
                    let traveled_waypoints = response.data.data;
                    mission_waypoints.map(waypoint => {
                        let index = traveled_waypoints.findIndex(measure => measure.waypoint._id === waypoint._id);
                        waypoint.icon = 0;
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
                            }
                            waypoint.images = traveled_waypoints[index].input.items.filter(item => {
                                return(item.model === "Camera")
                            }).map(item => {
                                return({ "camera_name": item.item.item_name, "image_name": item.item.data.image_name, "path": item.item.data.path, "timestamp": traveled_waypoints[index].input.timestamp});
                            });
                        }
                    })
                    this.setState({ logmission: response.data, map_waypoints: mission_waypoints });
                }
            })
            .catch(function (error){
                console.log(error);
            })
        axios.get('http://localhost:4000/log/')
            .then(response => {
                this.setState({ logs: response.data});
                console.log(response.data);
            })
            .catch(function (error){
                console.log(error);
            })
    }

    componentDidUpdate(){
        console.log("Update");
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
                real_time: !this.state.real_time,
                images: images,
                cameras: cameras,
                timestamp: timestamp,
                waypointName: waypoint.name
            });
        }
    }

    toggleRealTime() {
        this.setState({
            real_time: !this.state.real_time,
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

        let logs = this.state.logs.map(mission => {
            let circle_color = "b-" + mission.levelname.toLowerCase() + " update-icon ring";
            let text_color = "t-" + mission.levelname.toLowerCase();
            let date = new Date(Date.parse(mission.date));
            return (
                <div className="row p-t-15 p-b-15">
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

        let has_mission = this.state.logmission.hasOwnProperty('mode');
        console.log("TEST", this.state.logmission);
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
        
        return (
            <div class="row">
                <div className="currentState">
                    <button type="button" class="btn btn-light">{this.modeMapping[this.state.currentMode]}</button>
                </div>
                <div class="col-md-12 col-xl-6">
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
                            <MapWaypoints waypoints={this.state.map_waypoints} robotPose={true} onMarkerClick={this.onMarkerClick} showPath={true} height={"102.5vh"}/>
                        </div>
                    </div>
                </div>
                <div  class="col-md-12 col-xl-6">
                    <div className="card">
                        {this.state.real_time ?
                        <div className="card-header">
                            <h5>{this.state.cameras[this.state.current_index]}</h5>
                            <div className="card-header-right-text" style={{paddingTop: "0px"}}>
                                <button type="button" class="btn btn-success">REAL-TIME</button>
                            </div>
                        </div> :
                        <div className="card-header">
                            <h5>{this.state.cameras[this.state.current_index]}  | </h5><span style={{color: '#7e7e7e', fontSize:"0.9em"}}>Waypoint {this.state.waypointName}</span><br/>
                            <span className="caption-text">Photo taken at {this.state.timestamp[this.state.current_index]}</span>
                            <div className="card-header-right-text" style={{paddingTop: "0px"}}>
                                <button type="button" onClick={this.toggleRealTime} class="btn btn-secondary">REAL-TIME</button>
                            </div>
                        </div>
                        }
                        <div className="card-block" style={{paddingTop: "5px"}}>
                            <ImageGallery onSlide={this.onSlide} defaultImage={"/error.jpg"} items={this.state.images} showThumbnails={false} showPlayButton={false} showBullets={true}/>
                        </div>
                    </div>
                    <div className="card latest-update-card" style={{marginTop: "20px"}}>
                        <div className="card-header">
                            <h5>Latest Activity</h5>
                        </div>
                        <div className="card-block" style={{paddingTop: "0px"}}>
                            <Scrollbars autoHide style={{ width: "auto", height: "260px" }}>
                                <div className="latest-update-box">
                                    {logs}
                                </div>
                            </Scrollbars>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}