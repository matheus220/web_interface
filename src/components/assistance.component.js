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
            navigateTo: null,
            currentMode: null,
            imageLoaded: false,
            publishImmidiately: true,
            linear: 0,
            angular: 0,
            stopPub: false
        };

        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.modeCallback = this.modeCallback.bind(this);
        this.saveData = this.saveData.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.onSlide = this.onSlide.bind(this);
        this.toggleRealTime = this.toggleRealTime.bind(this);
        this.addNotification = this.addNotification.bind(this);
        this.requestMovesBase = this.requestMovesBase.bind(this);
        this.notificationDOMRef = React.createRef();
        this.onImageLoad = this.onImageLoad.bind(this);
        this.joystickCmd = this.joystickCmd.bind(this);
        this.moveAction = this.moveAction.bind(this);

        this.ros = new ROSLIB.Ros({
            url: "ws://" + process.env.REACT_APP_ROS_MASTER_IP + ":9090"
        });

        this.changeControlPublisher = new ROSLIB.Topic({
            ros : this.ros,
            name : '/change_control',
            messageType : 'std_msgs/String',
            throttle_rate : 10
        });

        this.saveDataPublisher = new ROSLIB.Topic({
            ros : this.ros,
            name : '/order_to_save',
            messageType : 'std_msgs/Empty',
            throttle_rate : 10
        });

        this.currentModeListener = new ROSLIB.Topic({
            ros : this.ros,
            name : '/current_mode',
            messageType : 'std_msgs/String',
            throttle_rate : 1
        });

        this.cmdVelPublisher = new ROSLIB.Topic({
            ros: this.ros,
            name: '/assisted_teleop_cmd_vel',
            messageType: 'geometry_msgs/Twist'
        });

        this.currentModeListener.subscribe(this.modeCallback);
        this.changeControlPublisher.advertise();
        this.saveDataPublisher.advertise();
        this.cmdVelPublisher.advertise();

        this.timer = null;
        this.cmdPubTimer = null;
    }

    modeCallback(currentMode) {
        this.setState({currentMode: currentMode.data})
    }

    fetchData() {
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':4000/logmission/last/assistance')
            .then(response => {
                if (response.data !== null) {
                    if (response.data.status === 'active') {
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

    componentWillUnmount() {
        this.changeControlPublisher.unadvertise();
        this.saveDataPublisher.unadvertise();
        this.cmdVelPublisher.unadvertise();
        this.currentModeListener.unsubscribe(this.modeCallback);
        clearTimeout(this.timer); 
        clearInterval(this.cmdPubTimer);
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

    requestMovesBase(point) {
        this.setState({changeControlTo:'semi_autonomous' , navigateTo: point});
        this.requestControlChange();
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
            this.setState({changeControlTo:null , navigateTo: null});
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
        this.timer = setTimeout(this.fetchData, 1500); 
        this.addNotification();
    }

    onSlide(currentIndex) {
        this.setState({
            currentCameraIndex: currentIndex
        });
    }

    onImageLoad(event) {
        this.setState({imageLoaded: true});
    }

    moveAction() {
        let {linear, angular} = this.state;
        if(this.state.stopPub){
            linear = 0.0;
            angular = 0.0;
            clearInterval(this.cmdPubTimer)
            this.setState({stopPub: false})
        }
        let twist = new ROSLIB.Message({ 
            linear: { x: 0, y: 0, z: 0 },
            angular: { x: 0, y: 0, z: 0 }
        });

        if (linear !== undefined && angular !== undefined) {
            twist.linear.x = linear;
            twist.angular.z = angular;
        } else {
            twist.linear.x = 0;
            twist.angular.z = 0;
        }
        this.cmdVelPublisher.publish(twist);
    }

    loopMoveAction() {
        this.cmdPubTimer = setInterval(this.moveAction, 100);
    }

    joystickCmd(evt, data) {
        var direction = data.angle.degree - 90;
        if (direction > 180) {
            direction = -(450 - data.angle.degree);
        }

        // convert angles to radians and scale linear and angular speed
        // adjust if you want robot to drvie faster or slower
        var lin = Math.cos(direction / 57.29) * (data.distance/75) * 0.4;
        var ang = Math.sin(direction / 57.29) * (data.distance/75) * 0.7;
        // nipplejs is triggering events when joystic moves each pixel
        // we need delay between consecutive messege publications to 
        // prevent system from being flooded by messages
        // events triggered earlier than 50ms after last publication will be dropped 
        this.setState({linear: lin, angular: ang});
    }

    render() {
        let {currentMode} = this.state;
        let showTeleopButton = currentMode !== null && currentMode !== 'TELEOPERATION';
        return (
            <div className="row">
                <div className="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-block">
                            <MapWaypoints waypoints={this.state.mapWaypoints} robotPose={true} onMarkerCreation={this.requestMovesBase} inicialPoseMarkerCreated={null} showLastMarkerCreated={true} onMarkerClick={this.onMarkerClick} showPath={false} height={"83vh"}/>
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-6">
                    <div className="card">
                        { this.state.waypointName ?
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div className="col-12 col-sm-9" style={{paddingLeft: "0px"}}>
                                <h5>{this.state.cameras[this.state.currentCameraIndex]}  | </h5><span style={{color: '#7e7e7e', fontSize:"0.9em"}}> Waypoint {this.state.waypointName}</span><br/>
                                <span className="caption-text">Photo taken at {this.state.timestamp[this.state.currentCameraIndex]}</span>
                            </div>
                            <div className="col-12 col-sm-3 d-flex justify-content-end" style={{paddingRight: "0px"}}>
                                <button type="button" onClick={this.toggleRealTime} className="btn btn-sm btn-secondary">REAL-TIME</button>
                            </div>
                        </div> :
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div className="col-12 col-sm-9" style={{paddingLeft: "0px"}}>
                                <h5>{this.state.cameras[this.state.currentCameraIndex]}</h5>
                            </div>
                            <div className="col-12 col-sm-3 d-flex justify-content-end" style={{paddingRight: "0px"}}>
                                <button type="button" className="btn btn-sm btn-success">REAL-TIME</button>
                            </div>
                        </div>
                        }
                        <div className="card-block image-block" style={{paddingTop: "5px"}}>
                            <ImageGallery onImageLoad={this.onImageLoad} onSlide={this.onSlide} defaultImage={"/error.jpg"} items={this.state.images} infinite={false} lazyLoad={true} showThumbnails={false} showPlayButton={false} showBullets={true}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 col-xl-3 d-flex">
                            <div className="card flex-grow-1">
                                {this.state.imageLoaded &&
                                <div className="card-block change-mode-card flex-grow-1 d-flex align-content-around flex-wrap">
                                    {showTeleopButton ? <button type="button" className="btn btn-primary" onClick={()=>this.setState({changeControlTo: "assisted_teleop"}, () => this.requestControlChange())} style={{width: "100%", height:"60px"}}>Teleoperation</button> : null}
                                    <ReactNotification ref={this.notificationDOMRef} />
                                    <button type="button" className="btn btn-success" onClick={this.saveData} style={{width: "100%", height:"60px"}}>Save data</button>
                                    <button type="button" className="btn btn-danger" onClick={()=>this.setState({changeControlTo: "exit"}, () => this.requestControlChange())} style={{width: "100%", height:"60px"}}>Exit</button>
                                </div>}
                            </div>
                        </div>
                        <div className="col-md-12 col-xl-9">
                            <div className="card">
                                <div className="card-block change-mode-card d-flex justify-content-center">
                                    {this.state.imageLoaded ? 
                                        <ReactNipple
                                            options={{ mode: 'static', position: { top: '54%', left: '50%' }, color: '#0066ff', size: 150}}
                                            style={{
                                                width: 200,
                                                height: 230 ,
                                                position: 'relative'
                                                // if you pass position: 'relative', you don't need to import the stylesheet
                                            }}
                                            onMove={(evt, data) => this.joystickCmd(evt, data)}
                                            onStart={(evt, data) => this.loopMoveAction()}
                                            onEnd={(evt, data) => this.setState({stopPub: true})}
                                        /> :
                                        null
                                    }
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

        this.ros = new ROSLIB.Ros({
            url: "ws://" + process.env.REACT_APP_ROS_MASTER_IP + ":9090"
        });

        this.currentModeListener = new ROSLIB.Topic({
            ros : this.ros,
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
        if (currentMode.data === "TELEOPERATION" || currentMode.data === "SEMI AUTONOMOUS") {
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
