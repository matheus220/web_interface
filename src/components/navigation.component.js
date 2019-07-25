import React, { Component } from 'react';
import ImageGallery from 'react-image-gallery';
import MapWaypoints from "./map.component";
import { Scrollbars } from 'react-custom-scrollbars';
import axios from 'axios';
import "react-image-gallery/styles/css/image-gallery.css";
//http://192.168.1.96:8080/stream?topic=/usb_cam/image_raw&type=mjpeg&quality=50
//http://lorempixel.com/1000/600/nature/1/
export default class Navigation extends Component {
    constructor(props) {
        super(props);
        this.defaultImages = [
            { original: 'http://192.168.1.96:8080/stream?topic=/camera/image_raw&type=mjpeg&quality=20' },
            { original: 'http://192.168.1.96:8080/stream?topic=/camera2/image2_raw&type=mjpeg&quality=20' },
            { original: 'http://192.168.1.96:8080/stream?topic=/camera3/image3_raw&type=mjpeg&quality=20' }
        ]

        this.state = {
            logmission: {},
            map_waypoints: [],
            logs: [],
            images: this.defaultImages
        };

        this.onMarkerClick = this.onMarkerClick.bind(this);
    }
    
    componentDidMount() {
        axios.get('http://localhost:4000/logmission/')
            .then(response => {
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
                            return(item.model == "Camera")
                        }).map(item => {
                            return({ "camera_name": item.item.item_name, "image_name": item.item.data.image_name, "path": item.item.data.path, "timestamp": traveled_waypoints[index].input.timestamp});
                        });
                    }
                })
                console.log(mission_waypoints);
                this.setState({ logmission: response.data, map_waypoints: mission_waypoints });
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
            this.setState({
                images: images
            });
            console.log(images);
        }
    }

    render() {

        let logs = this.state.logs.map(mission => {
            return (
                <div className="row p-t-20 p-b-30">
                    <div className="col-auto text-right update-meta p-r-0">
                        <i className="b-primary update-icon ring"></i>
                    </div>
                    <div className="col p-l-5" style={{width: "100%"}}>
                        <h6>[{mission.levelname}] {mission.date}</h6>
                        <p className="text-muted m-b-0">
                            {mission.message}
                        </p>
                    </div>
                </div>
            );
        });

        console.log(this.poseListener);

        return (
            <div class="row">
                <div class="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Current Mission</h5>
                            <div className="card-header-right-text">
                                <strong>Mission room1</strong><br/>
                                Started at 11:19 PM
                            </div>
                        </div>
                        <div className="card-block" style={{paddingTop: "5px"}}>
                            <MapWaypoints waypoints={this.state.map_waypoints} robotPose={true} onMarkerClick={this.onMarkerClick} showPath={true} height={"73vh"}/>
                        </div>
                    </div>
                </div>
                <div  class="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Real time camera</h5>
                            <div className="card-header-right-text">
                                <strong>Camera 1</strong><br/>
                                Started at 11:19 PM
                            </div>
                        </div>
                        <div className="card-block" style={{paddingTop: "5px"}}>
                            <ImageGallery defaultImage={"/error.jpg"} items={this.state.images} showThumbnails={false} showPlayButton={false} showBullets={true}/>
                        </div>
                    </div>
                    <div className="card" style={{marginTop: "20px"}}>
                        <div className="card-header">
                            <h5>Latest Activity</h5>
                        </div>
                        <div className="card-block" style={{paddingTop: "0px"}}>
                            <Scrollbars autoHide style={{ width: "100%", height: "300px" }}>
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