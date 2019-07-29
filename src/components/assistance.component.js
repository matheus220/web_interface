import React, { Component } from "react";
import ReactLoading from 'react-loading';
import ROSLIB from 'roslib';
import axios from 'axios';
import MapWaypoints from "./map.component";
import ImageGallery from 'react-image-gallery';
import ReactNipple from 'react-nipple';
import 'react-nipple/lib/styles.css';

function LoadingScreen() {
    return (
        <div className="row">
            <div className="col-md-12 col-xl-12">
                <div className="card d-flex justify-content-center" style={{height: "80vh"}}>
                    <div style={{margin: "auto", width: "400px", height: "150px", textAlign:"center"}}>
                        <div className="d-flex justify-content-center" style={{margin:"0px auto"}}>
                            <ReactLoading type="spinningBubbles" color="#343A40" height={'80px'} width={'80px'} />
                        </div>
                        <h5 style={{marginTop: "30px"}}>Verifying authorization to access this page</h5>
                    </div>
                </div>
            </div>
        </div>
    );
}

class AssistanceScreen extends Component {
    constructor(props) {
        super(props);

        this.defaultImages = [
            { original: 'http://192.168.1.96:8080/stream?topic=/camera/image_raw&type=mjpeg&quality=20' },
            { original: 'http://192.168.1.96:8080/stream?topic=/camera2/image2_raw&type=mjpeg&quality=20' },
            { original: 'http://192.168.1.96:8080/stream?topic=/camera3/image3_raw&type=mjpeg&quality=20' }
        ]
        this.defaultCameras = ['camera1', 'camera2', 'camera3']

        this.state = {
            images: this.defaultImages,
            cameras: this.defaultCameras
        };
    }

    componentDidMount() {
        axios.get('http://localhost:4000/logmission/last/assistance')
            .then(response => {
                if (response.data !== null) {
                    let traveled_waypoints = response.data.data;
                    traveled_waypoints.map(waypoint => {
                        if(waypoint.hasOwnProperty('input')) {
                            waypoint.images = waypoint.input.items.filter(item => {
                                return(item.model === "Camera")
                            }).map(item => {
                                return({ "camera_name": item.item.item_name, "image_name": item.item.data.image_name, "path": item.item.data.path, "timestamp": waypoint.input.timestamp});
                            });
                        }
                        return(waypoint);
                    })
                    this.setState({ logmission: response.data});
                } else {
                    this.setState({ logmission: []});
                }
            })
            .catch(function (error){
                console.log(error);
            })
    }
    
    render() {
        return (
            <div className="row">
                <div className="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Map</h5>
                        </div>
                        <div className="card-block" style={{paddingTop: "5px"}}>
                            <MapWaypoints waypoints={[]} robotPose={true} showPath={false} height={"80.9vh"}/>
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Title</h5>
                        </div>
                        <div className="card-block" style={{paddingTop: "5px", minHeight: "400px"}}>
                            <ImageGallery defaultImage={"/error.jpg"} items={this.state.images} lazyLoad={false} showThumbnails={false} showPlayButton={false} showBullets={true}/>
                        </div>
                    </div>
                    <div className="card" style={{marginTop: "20px"}}>
                        <div className="card-block change-mode-card d-flex justify-content-center" style={{paddingTop: "5px"}}>
                            <ReactNipple
                                options={{ mode: 'static', position: { top: '54%', left: '50%' }, color: '#0066ff', size: 150}}
                                style={{
                                    width: 200,
                                    height: 200,
                                    position: 'relative'
                                    // if you pass position: 'relative', you don't need to import the stylesheet
                                }}
                                onMove={(evt, data) => console.log(evt, data)}
                            />
                        </div>
                    </div>
                    
                </div>
            </div>
        )
    }
}

export default class Assistance extends Component {
    constructor(props) {
        super(props);
        this.handleTimeout = this.handleTimeout.bind(this);
        this.modeCallback = this.modeCallback.bind(this);

        this.state = {
            displayLoading: true,
        };

        let robot_IP = "192.168.1.96";

        let ros = new ROSLIB.Ros({
            url: "ws://" + robot_IP + ":9090"
        });

        this.currentModeListener = new ROSLIB.Topic({
            ros : ros,
            name : '/current_mode',
            messageType : 'std_msgs/String',
            throttle_rate : 1
        });

        this.currentModeListener.subscribe(this.modeCallback);

        this.timer = setTimeout(this.handleTimeout, 10000);
    }

    componentDidMount() {
        //this.modeCallback("TELEOPERATION");
    }

    modeCallback(currentMode) {
        if (currentMode.data === "TELEOPERATION") {
            this.setState({displayLoading: false});
            clearTimeout(this.timer);
        } else {
            this.setState({displayLoading: true});
            clearTimeout(this.timer);
            this.timer = setTimeout(this.handleTimeout, 10000);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        this.currentModeListener.unsubscribe(this.modeCallback);
    }

    handleTimeout() {
        this.props.history.push('/');
    }

    render() {
        const {displayLoading} = this.state;

        if (displayLoading) return LoadingScreen();

        return <AssistanceScreen />;
    }
}
