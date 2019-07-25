import React, { Component } from 'react';
import ImageGallery from 'react-image-gallery';
import MapWaypoints from "./map.component";
import { Scrollbars } from 'react-custom-scrollbars';
import axios from 'axios';
import "react-image-gallery/styles/css/image-gallery.css";

export default class Navigation extends Component {
    constructor(props) {
        super(props);
        this.defaultImages = [
            { original: 'http://lorempixel.com/1000/600/nature/1/' },
            { original: 'http://lorempixel.com/1000/600/nature/2/' },
            { original: 'http://lorempixel.com/1000/600/nature/3/' }
        ]

        this.state = {
            logmission: {},
            map_waypoints: [],
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
                        waypoint.images = traveled_waypoints[index].input;
                    }
                })
                console.log(mission_waypoints);
                this.setState({ logmission: response.data, map_waypoints: mission_waypoints });
            })
            .catch(function (error){
                console.log(error);
            })
    }

    onMarkerClick(e) {
        let waypoint = this.state.map_waypoints.find(wp => wp._id === e.target.options.id);
        if( waypoint.hasOwnProperty('images') ) {
            let images = waypoint.images.map(img => {
                return {original: img};
            });
            this.setState({
                images: images
            });
            console.log(images);
        }
    }

    render() {
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
                            <ImageGallery items={this.state.images} showThumbnails={false} showPlayButton={false} showBullets={true}/>
                        </div>
                    </div>
                    <div className="card" style={{marginTop: "20px"}}>
                        <div className="card-header">
                            <h5>Latest Activity</h5>
                        </div>
                        <div className="card-block" style={{paddingTop: "0px"}}>
                            <Scrollbars autoHide style={{ width: "100%", height: "300px" }}>
                                <div className="latest-update-box">
                                    <div className="row p-t-20 p-b-30">
                                        <div className="col-auto text-right update-meta p-r-0">
                                            <i className="b-primary update-icon ring"></i>
                                        </div>
                                        <div className="col p-l-5">
                                            <h6>[INFO] 25-07-2019 10:06 PM</h6>
                                            <p className="text-muted m-b-0">
                                                Message
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Scrollbars>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}