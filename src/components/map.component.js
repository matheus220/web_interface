import React, { Component } from 'react';
import ROSLIB from 'roslib';
import { Map, ImageOverlay, Popup, Polyline } from "react-leaflet";
import L from 'leaflet';
import PolylineDecorator from "./polyline-decorator.component";
import RotatedMarker from "./rotated-marker.component";

import map from "./../WD_WA_WB.png";

const rosQuaternionToGlobalTheta = function(orientation) {
    // convert to radians
    var q0 = orientation.w;
    var q1 = orientation.x;
    var q2 = orientation.y;
    var q3 = orientation.z;
    var theta = Math.atan2(2 * (q0 * q3 + q1 * q2), 1 - 2 * (Math.pow(q2, 2) + Math.pow(q3, 2)));

    return theta;
};

const arrow = [
    {offset: "10%", repeat: "200px", symbol: L.Symbol.arrowHead({pixelSize: 12, polygon: false, pathOptions: {opacity:0.8, weight:2, stroke: true, color: '#f00'}})}
];

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

var LeafIcon = L.Icon.extend({
    options: {
        iconSize:     [28, 30],
        iconAnchor:   [14, 30],
        popupAnchor:  [0, -36]
    }
});

var robotPoseIcon = new LeafIcon({
    iconUrl: require('./../navigation.png'),
    iconSize:     [34, 34],
    iconAnchor:   [17, 17],
    popupAnchor:  [0, -20]
});

var robotPoseIcon1 = new LeafIcon({
    iconUrl: require('./../navigation1.png'),
    iconSize:     [34, 34],
    iconAnchor:   [17, 17],
    popupAnchor:  [0, -20]
});

var robotPoseIcon2 = new LeafIcon({
    iconUrl: require('./../navigation2.png'),
    iconSize:     [34, 34],
    iconAnchor:   [17, 17],
    popupAnchor:  [0, -20]
});

var icons = [
    new LeafIcon({iconUrl: require('./../blue.png')}),
    new LeafIcon({iconUrl: require('./../green.png')}), 
    new LeafIcon({iconUrl: require('./../red.png')}),
    new LeafIcon({iconUrl: require('./../orange.png')}),
    new LeafIcon({iconUrl: require('./../purple.png')}),
    new LeafIcon({iconUrl: require('./../grey.png')}),
    robotPoseIcon,
    robotPoseIcon1,
    robotPoseIcon2
]

const bounds = [[-396.06, -1771.58], [2103.94, 728.42]]

export default class MapWaypoints extends Component {

    constructor(props) {
        super(props);
        this.state = {
            polyline: [],
            robot_pose: [9999999.9, 9999999.9, 9999999.9],
            addMarker: null,
            addMarkerOrientation: null,
            lastMarkerCreated: this.props.inicialPoseMarkerCreated
        };

        this._onMarkerClick = this._onMarkerClick.bind(this);
        this._pose_callback = this._pose_callback.bind(this);
        this._onMarkerCreation = this._onMarkerCreation.bind(this);
        this.ondblclick = this.ondblclick.bind(this);
        this.onmousemove = this.onmousemove.bind(this);
        this.onmouseout = this.onmouseout.bind(this);
        this.onclick = this.onclick.bind(this);

        this.ros = new ROSLIB.Ros({
            url: "ws://" + process.env.REACT_APP_ROS_MASTER_IP + ":9090"
        });

        this.poseListener = new ROSLIB.Topic({
            ros : this.ros,
            name : '/amcl_pose',
            messageType : 'geometry_msgs/PoseWithCovarianceStamped',
            throttle_rate : 1
        });

        this.poseListener.subscribe(this._pose_callback);
    }

    _pose_callback (msg) {
        let x = (msg.pose.pose.position.x).toFixed(1);
        let y = (msg.pose.pose.position.y).toFixed(1);
        let orientation = rosQuaternionToGlobalTheta(msg.pose.pose.orientation).toFixed(2);
        if (x !== this.state.robot_pose[0] || y !== this.state.robot_pose[1] || orientation !== this.state.robot_pose[2]) {
            this.setState({
                robot_pose: [ x, y, orientation ]
            });
        }
    }

    _onMarkerCreation(point) {
        if(typeof this.props.onMarkerCreation === "function") {
            this.props.onMarkerCreation(point);
        }
    }

    _onMarkerClick(e) {
        if(typeof this.props.onMarkerClick === "function") {
            this.props.onMarkerClick(e);
        }
    }

    componentWillReceiveProps(nextProps){
        if (JSON.stringify(nextProps.inicialPoseMarkerCreated) !== JSON.stringify(this.props.inicialPoseMarkerCreated)) {
          this.setState({ lastMarkerCreated: nextProps.inicialPoseMarkerCreated })
        }
    }

    componentWillUnmount() {
        this.poseListener.unsubscribe(this._pose_callback);
    }

    pointList(waypoints) {
        return waypoints.map((waypoint) => [waypoint.point[1]/0.05, waypoint.point[0]/0.05])
    }

    ondblclick(e) {
        if(typeof this.props.onMarkerCreation === "function") {
            this.setState({
                addMarker: [(0.05*e.latlng.lng).toFixed(2), (0.05*e.latlng.lat).toFixed(2)],
                addMarkerOrientation: 0,
                lastMarkerCreated: null
            })
        }
    }

    onmousemove(e) {
        var {addMarker} = this.state;
        if(addMarker) {
            let dy = 0.05*e.latlng.lat - addMarker[1];
            let dx = 0.05*e.latlng.lng - addMarker[0];
            let rotation = (-Math.atan2(dy, dx)).toFixed(5);
            this.setState({addMarkerOrientation: rotation});
        }
    }

    onmouseout(e) {
        var {addMarker} = this.state;
        if (!addMarker) this.setState({addMarker: null});
    }

    onclick(e) {
        var {addMarker} = this.state;
        if(addMarker) {
            let point = [parseFloat(addMarker[0]), parseFloat(addMarker[1]), -this.state.addMarkerOrientation];
            this._onMarkerCreation(point);
            this.setState({addMarker: null, lastMarkerCreated: point});
        }
    }

    render() {
        let show_robot_pose = this.state.robot_pose !== [9999999.9, 9999999.9, 9999999.9] && this.props.robotPose
        let showPath = this.props.showPath && this.props.waypoints.length !==0;
        let showLastMarkerCreated = this.props.showLastMarkerCreated && this.state.lastMarkerCreated;
        return (
            <div>
                <Map onMouseMove={this.onmousemove} onMouseOut={this.onmouseout} onDblClick={this.ondblclick} doubleClickZoom={false} onClick={this.onclick} crs={L.CRS.Simple} zoomDelta={0.3} zoomSnap={0} minZoom={-2.15} maxZoom={2} bounds={bounds} style={{ height: this.props.height ? this.props.height : "80vh", width: "100%", backgroundColor: "#cdcdcd" }}>
                    <ImageOverlay
                        bounds={bounds}
                        url={map}
                    />
                    {this.props.waypoints.map((waypoint) => 
                        <RotatedMarker 
                            onClick={this._onMarkerClick} 
                            rotationAngle={waypoint.showOrientation ? -waypoint.point[2]*180/(2*Math.PI)+22.5 : 0}
                            icon={icons[waypoint.icon ? waypoint.icon : 0]}
                            key={waypoint._id} 
                            id={waypoint._id} 
                            name={waypoint.name} 
                            position={[waypoint.point[1]/0.05, waypoint.point[0]/0.05]}>

                            {this.props.showPopup ? <Popup>
                                <span>{waypoint.name ? waypoint.name : 'unknown'}</span>
                            </Popup> : null}
                        </RotatedMarker>
                    )}
                    {show_robot_pose ? 
                        <RotatedMarker icon={robotPoseIcon} rotationAngle={-this.state.robot_pose[2]*180/(2*Math.PI)+22.5} position={[this.state.robot_pose[1]/0.05, this.state.robot_pose[0]/0.05]}/> 
                    : null}
                    {showLastMarkerCreated ?
                        <RotatedMarker icon={robotPoseIcon1} rotationAngle={-this.state.lastMarkerCreated[2]*180/(2*Math.PI)+22.5} position={[this.state.lastMarkerCreated[1]/0.05, this.state.lastMarkerCreated[0]/0.05]}/>
                    : null}
                    {this.state.addMarker ? 
                        <RotatedMarker icon={robotPoseIcon} rotationAngle={this.state.addMarkerOrientation*180/(2*Math.PI)+22.5} position={[this.state.addMarker[1]/0.05, this.state.addMarker[0]/0.05]}/> 
                    : null}
                    {showPath ? <Polyline patterns={arrow} color="red" weight={2.5} opacity={0.8} lineJoin="round" dashArray="10, 10" dashOffset="0" positions={this.pointList(this.props.waypoints)} /> : null}
                    {this.props.polyline && <Polyline patterns={arrow} color="red" weight={2.5} opacity={0.8} lineJoin="round" dashArray="10, 10" dashOffset="0" positions={this.pointList(this.props.polyline)} />}
                </Map>
            </div>
        )
    }
}