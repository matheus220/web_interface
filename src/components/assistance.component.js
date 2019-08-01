import React, { Component } from "react";
import ReactLoading from 'react-loading';
import ROSLIB from 'roslib';
import axios from 'axios';
import MapWaypoints from "./map.component";
import ImageGallery from 'react-image-gallery';
import ReactNipple from 'react-nipple';
import ReactNotification from "react-notifications-component";
import "react-notifications-component/dist/theme.css";

function FormatDate(date) {
    return(date.slice(5,-7))
}

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

function JoystickCmd(evt, data) {
    
    var direction = data.angle.degree - 90;
    if (direction > 180) {
        direction = -(450 - data.angle.degree);
    }
    // convert angles to radians and scale linear and angular speed
    // adjust if youwant robot to drvie faster or slower
    var lin = Math.cos(direction / 57.29) * data.distance * 0.005;
    var ang = Math.sin(direction / 57.29) * data.distance * 0.05;
    // nipplejs is triggering events when joystic moves each pixel
    // we need delay between consecutive messege publications to 
    // prevent system from being flooded by messages
    // events triggered earlier than 50ms after last publication will be dropped 
    console.log(lin, ang)
}


class AssistanceScreen extends Component {
    constructor(props) {
        super(props);

        this.defaultImages = [
            { original: 'http://192.168.1.96:8080/stream?topic=/camera/image_raw&type=mjpeg&quality=7' },
            { original: 'http://192.168.1.96:8080/stream?topic=/camera2/image2_raw&type=mjpeg&quality=7' },
            { original: 'http://192.168.1.96:8080/stream?topic=/camera3/image3_raw&type=mjpeg&quality=7' }
        ]
        this.defaultCameras = ['bass_camera', 'middle_camera', 'top_camera']

        this.state = {
            images: this.defaultImages,
            cameras: this.defaultCameras,
            currentCameraIndex: 0,
            logmission: null,
            mapWaypoints: [],
            timestamp: null,
            changeControlTo: null,
            navigateTo: null
        };

        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.saveData = this.saveData.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.onSlide = this.onSlide.bind(this);
        this.toggleRealTime = this.toggleRealTime.bind(this);
        this.addNotification = this.addNotification.bind(this);
        this.notificationDOMRef = React.createRef();

        let robot_IP = process.env.REACT_APP_ROS_MASTER_IP;

        let ros = new ROSLIB.Ros({
            url: "ws://" + robot_IP + ":9090"
        });

        this.changeControlPublisher = new ROSLIB.Topic({
            ros : ros,
            name : '/change_control',
            messageType : 'std_msgs/String',
            throttle_rate : 10
        });

        this.saveDataPublisher = new ROSLIB.Topic({
            ros : ros,
            name : '/order_to_save',
            messageType : 'std_msgs/Empty',
            throttle_rate : 10
        });

        this.changeControlPublisher.advertise();
        this.saveDataPublisher.advertise();

        this.timer = null;
    }

    fetchData() {
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':4000/logmission/last/assistance')
            .then(response => {
                if (response.data !== null) {
                    if (response.data.status === 'active') {
                        console.log("entrou no fetchData", response.data.data)
                        var mapWaypoints = [];
                        let traveledWaypoints = response.data.data;
                        mapWaypoints = traveledWaypoints.map(data => {
                            var waypoint = data.unknown_waypoint;
                            waypoint._id = data.unknown_waypoint.name
                            if(data.hasOwnProperty('input')) {
                                waypoint.images = data.input.items.filter(item => {
                                    return(item.model === "Camera")
                                }).map(item => {
                                    return({ "camera_name": item.item.item_name, "image_name": item.item.data.image_name, "path": item.item.data.path, "timestamp": data.input.timestamp});
                                });
                                waypoint.icon = 1;
                            } else {
                                waypoint.icon = 2;
                            }
                            return(waypoint);
                        })
                        this.setState({ logmission: response.data, mapWaypoints: mapWaypoints});
                    } else {
                        this.setState({ logmission: []});
                    }
                    
                } else {
                    this.setState({ logmission: []});
                }
            })
            .catch(function (error){
                console.log(error);
            })
    }

    componentDidMount() {
        //this.fetchData()
    }

    componentWillUnmount() {
        this.changeControlPublisher.unadvertise();
        this.saveDataPublisher.unadvertise();
        clearTimeout(this.timer); 
    }

    onMarkerClick(e) {
        let waypoint = this.state.mapWaypoints.find(wp => wp._id === e.target.options.id);
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
                images: images,
                cameras: cameras,
                timestamp: timestamp,
                waypointName: waypoint.name,
                currentCameraIndex: 0
            });
        }
    }

    requestControlChange(){
        var stringMessage = new ROSLIB.Message({
            data: ""
        });
        var date = new Date().toISOString();
        
        switch (this.state.changeControlTo) {
            case 'semi_autonomous':
                var navigateTo = this.state.navigateTo;
                if(navigateTo) {
                    let string = "[" + navigateTo[0] + ", " + navigateTo[1] + ", " + navigateTo[2] + "]";
                    stringMessage.data = "{\"timestamp\": \"" + date + "\", \"mode\": \"semi_autonomous\", \"waypoint\": " + string + "}";
                }
                break;
            case 'assisted_teleop':
                stringMessage.data = "{\"timestamp\": \"" + date + "\", \"mode\": \"assisted_teleop\"}"; 
                break;
            case 'exit':
                stringMessage.data = "{\"timestamp\": \"" + date + "\", \"mode\": \"exit\"}";
                break;
            default:
                console.log("No mode chosen")
        }
        if(stringMessage.data !== "") {
            this.changeControlPublisher.publish(stringMessage)
        }
    }

    toggleRealTime() {
        this.setState({
            images: this.defaultImages,
            cameras: this.defaultCameras,
            currentCameraIndex: 0,
            timestamp: null,
            waypointName: null
        });
    }

    addNotification() {
        this.notificationDOMRef.current.addNotification({
          title: "Data Saving",
          message: "Your order has been sent to the robot!",
          type: "success",
          insert: "top",
          width: 400,
          container: "top-center",
          animationIn: ["animated", "bounceIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: { duration: 2000 },
          dismissable: { click: true }
        });
    }
    
    saveData() {
        this.saveDataPublisher.publish();
        this.timer = setTimeout(this.fetchData, 2000); 
        this.addNotification();
    }

    onSlide(currentIndex) {
        this.setState({
            currentCameraIndex: currentIndex
        });
    }
    
    render() {
        return (
            <div className="row">
                <div className="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-block">
                            <MapWaypoints waypoints={this.state.mapWaypoints} robotPose={true} onMarkerClick={this.onMarkerClick} showPath={false} height={"83vh"}/>
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-6">
                    <div className="card">
                        { this.state.waypointName ?
                        <div className="card-header">
                            <h5>{this.state.cameras[this.state.currentCameraIndex]}  | </h5><span style={{color: '#7e7e7e', fontSize:"0.9em"}}>Waypoint {this.state.waypointName}</span><br/>
                            <span className="caption-text">Photo taken at {this.state.timestamp[this.state.currentCameraIndex]}</span>
                            <div className="card-header-right-text" style={{paddingTop: "7px"}}>
                                <button type="button" onClick={this.toggleRealTime} className="btn btn-secondary">REAL-TIME</button>
                            </div>
                        </div> :
                        <div className="card-header">
                            <h5>{this.state.cameras[this.state.currentCameraIndex]}</h5>
                            <div className="card-header-right-text" style={{paddingTop: "7px"}}>
                                <button type="button" className="btn btn-success">REAL-TIME</button>
                            </div>
                        </div>
                        }
                        <div className="card-block" style={{paddingTop: "5px", minHeight: "400px"}}>
                            <ImageGallery onSlide={this.onSlide} defaultImage={"/error.jpg"} items={this.state.images} infinite={false} lazyLoad={true} showThumbnails={false} showPlayButton={false} showBullets={true}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 col-xl-3 d-flex">
                            <div className="card flex-grow-1">
                                <div className="card-block change-mode-card flex-grow-1 d-flex align-content-between flex-wrap">
                                    <button type="button" className="btn btn-secondary" onClick={()=>this.setState({changeControlTo: "assisted_teleop"})} style={{width: "100%", height:"60px"}}>Teleoperation</button>
                                    <ReactNotification ref={this.notificationDOMRef} />
                                    <button type="button" className="btn btn-success" onClick={this.saveData} style={{width: "100%", height:"60px"}}>Save data</button>
                                    <button type="button" className="btn btn-danger" onClick={()=>this.setState({changeControlTo: "exit"})} style={{width: "100%", height:"60px"}}>Exit</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12 col-xl-9">
                            <div className="card">
                                <div className="card-block change-mode-card d-flex justify-content-center">
                                    <ReactNipple
                                        options={{ mode: 'static', position: { top: '54%', left: '50%' }, color: '#0066ff', size: 150}}
                                        style={{
                                            width: 200,
                                            height: 230 ,
                                            position: 'relative'
                                            // if you pass position: 'relative', you don't need to import the stylesheet
                                        }}
                                        onMove={(evt, data) => JoystickCmd(evt, data)}
                                    />
                                </div>
                            </div>
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

        this.timer = setTimeout(this.handleTimeout, 5000);
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
            this.timer = setTimeout(this.handleTimeout, 5000);
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
