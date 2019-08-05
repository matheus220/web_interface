import React, { Component } from 'react';
import ImageGallery from 'react-image-gallery';
import ROSLIB from 'roslib';
import MapWaypoints from "./map.component";
import { Scrollbars } from 'react-custom-scrollbars';
import axios from 'axios';
import "react-image-gallery/styles/css/image-gallery.css";
import 'react-widgets/dist/css/react-widgets.css';

function FormatDate(date) {
    return(date.slice(5,-7))
}

export default class Navigation extends Component {
    constructor(props) {
        super(props);
        this.defaultImages = [
            { original: 'http://192.168.1.96:8080/stream?topic=/camera/image_raw&type=mjpeg&quality=7' },
            { original: 'http://192.168.1.96:8080/stream?topic=/camera2/image2_raw&type=mjpeg&quality=7' },
            { original: 'http://192.168.1.96:8080/stream?topic=/camera3/image3_raw&type=mjpeg&quality=7' }
        ]
        this.defaultCameras = ['bass_camera', 'middle_camera', 'top_camera']

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
            currentMode: "UNDEFINED"
        };

        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.toggleRealTime = this.toggleRealTime.bind(this);
        this.onSlide = this.onSlide.bind(this);
        this._mode_callback = this._mode_callback.bind(this);
        this.fetchData = this.fetchData.bind(this);
        
        this.ros = new ROSLIB.Ros({
            url: "ws://" + process.env.REACT_APP_ROS_MASTER_IP + ":9090"
        });

        this.currentModeListener = new ROSLIB.Topic({
            ros : this.ros,
            name : '/current_mode',
            messageType : 'std_msgs/String',
            throttle_rate : 1
        });

        this.currentModeListener.subscribe(this._mode_callback);

        this.interval = null;
    }

    _mode_callback (currentMode) {
        if (currentMode.data !== this.state.currentMode) {
            this.setState({currentMode: currentMode.data});
        }
    }

    fetchData() {
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':4000/logmission/last/patrol')
            .then(response => {
                if (response.data !== this.state.logmission) {
                    let mission_waypoints = response.data.mission_id.path;
                    let traveled_waypoints = response.data.data;
                    mission_waypoints.map(waypoint => {
                        let index = traveled_waypoints.findIndex(measure => measure.waypoint._id === waypoint._id);
                        waypoint.icon = 5;
                        waypoint.showOrientation = false;
                        if (index !== -1) {
                            switch (traveled_waypoints[index].status) {
                            case 'succeeded':
                                waypoint.icon = 1;
                                break;
                            case 'active':
                                waypoint.icon = 8;
                                waypoint.showOrientation = true;
                                break;
                            case 'aborted':
                                waypoint.icon = 2;
                                break;
                            default:
                                waypoint.icon = 5;
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
                }
            })
            .catch(function (error){
                console.log(error);
            })
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':4000/log/')
            .then(response => {
                if(response.data.length) {
                    if(this.state.logs.length) {
                        if(response.data[0]._id !== this.state.logs[0]._id) {
                            this.setState({ logs: response.data});
                        }
                    } else {
                        this.setState({ logs: response.data});
                    }
                }
            })
            .catch(function (error){
                console.log(error);
            })
    }

    componentDidMount() {
        this.fetchData();
        this.interval = setInterval(this.fetchData, 8000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.currentModeListener.unsubscribe(this._mode_callback);
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
                return FormatDate(date.toUTCString());
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

    toggleRealTime() {
        this.setState({
            real_time: true,
            images: this.defaultImages,
            cameras: this.defaultCameras,
            current_index: 0,
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
                        <h6><strong className={text_color}>{mission.levelname}</strong> | {FormatDate(date.toUTCString())}</h6>
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
                mission_time_info = "Finished at " + FormatDate(date.toUTCString());
                title = "Last mission";
            } else {
                let date = new Date(Date.parse(this.state.logmission.start_time));
                mission_time_info = "Started at " + FormatDate(date.toUTCString());
                title = "Current mission";
            }
        }

        return (
            <div className="row">
                <div className="col-md-12 col-xl-6">
                    <div className="card">
                        {has_mission ? 
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div className="col-12 col-sm-6" style={{paddingLeft: "0px"}}>
                                <h5>{title}</h5>
                            </div>
                            {this.state.logmission.mission_id ?
                            <div className="col-12 col-sm-6" style={{paddingRight: "0px", textAlign:"right"}}>
                                <h5>Mission {this.state.logmission.mission_id.name}</h5><br/>
                                <span className="caption-text">{mission_time_info}</span>
                            </div> : ""}
                        </div> :
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div className="col-12 col-sm-6" style={{paddingLeft: "0px"}}>
                                <h5>No missions performed</h5>
                            </div>
                        </div>
                        }
                        <div className="card-block" style={{paddingTop: "5px"}}>
                            <MapWaypoints waypoints={this.state.map_waypoints} robotPose={true} onMarkerClick={this.onMarkerClick} showPath={true} height={"80.9vh"}/>
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-6 d-flex flex-column">
                    <div className="card">
                        {this.state.real_time ?
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div className="col-12 col-sm-6" style={{paddingLeft: "0px"}}>
                                <h5>{this.state.cameras[this.state.current_index]}</h5><br/>
                            </div>
                            <div className="col-12 col-sm-6 d-flex justify-content-end" style={{paddingRight: "0px"}}>
                                <button type="button" className="btn btn-sm btn-success">REAL-TIME</button>
                            </div>
                        </div> :
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div className="col-12 col-sm-6" style={{paddingLeft: "0px"}}>
                                <h5>{this.state.cameras[this.state.current_index]}  | </h5><span style={{color: '#7e7e7e', fontSize:"0.9em"}}> Waypoint {this.state.waypointName}</span><br/>
                                <span className="caption-text">Photo taken at {this.state.timestamp[this.state.current_index]}</span>
                            </div>
                            <div className="col-12 col-sm-6 d-flex justify-content-end" style={{paddingRight: "0px"}}>
                                <button type="button" onClick={this.toggleRealTime} className="btn btn-sm btn-secondary">REAL-TIME</button>
                            </div>
                        </div>
                        }
                        <div className="card-block image-block" style={{paddingTop: "5px"}}>
                            <ImageGallery onSlide={this.onSlide} defaultImage={"/error.jpg"} items={this.state.images} infinite={false} lazyLoad={true} showThumbnails={false} showPlayButton={false} showBullets={true}/>
                        </div>
                    </div>
                    <div className="card latest-update-card flex-grow-1">
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div className="col-12 col-sm-6" style={{paddingLeft: "0px"}}>
                                <h5>Latest Activity</h5>
                            </div>
                        </div>
                        <div className="card-block flex-grow-1" style={{paddingTop: "0px"}}>
                            {logs.length ?
                            <Scrollbars autoHide style={{ width: "100%", height: "100%" }}>
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