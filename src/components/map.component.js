import React, { Component } from 'react';
import { Map, ImageOverlay, Marker, Popup, Polyline } from "react-leaflet";
import L from 'leaflet';

import map from "./../WD_WA_WB.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

var LeafIcon = L.Icon.extend({
    options: {
        iconSize:     [35, 40],
        iconAnchor:   [17.5, 40],
        popupAnchor:  [-5, -46]
    }
});

var icons = [
    new LeafIcon({iconUrl: require('./../blue.png')}),
    new LeafIcon({iconUrl: require('./../green.png')}), 
    new LeafIcon({iconUrl: require('./../red.png')}),
    new LeafIcon({iconUrl: require('./../orange.png')}),
    new LeafIcon({iconUrl: require('./../purple.png')})
]

var robotPoseIcon = new LeafIcon({
    iconUrl: require('./../navigation.png'),
    iconSize:     [34, 34],
    iconAnchor:   [17, 17],
    popupAnchor:  [-5, -46]
});

const bounds = [[-396.06, -1771.58], [2103.94, 728.42]]
const style = { height: "80vh", width: "100%", backgroundColor: "#cdcdcd" }

export default class MapWaypoints extends Component {

    constructor(props) {
        super(props);
        this.state = {polyline : []};
        this.robot_pose = [9.0, 39.0, 0.0]

        this._onMapClick = this._onMapClick.bind(this);
        this._onMarkerClick = this._onMarkerClick.bind(this);
    }

    _onMapClick(e) {
        if(typeof this.props.onMapClick === "function") {
            this.props.onMapClick(e);
        }
    }

    _onMarkerClick(e) {
        if(typeof this.props.onMarkerClick === "function") {
            this.props.onMarkerClick(e);
        }
    }

    pointList(waypoints) {
        return waypoints.map((waypoint) => [waypoint.point[1]/0.05, waypoint.point[0]/0.05])
    }

    render() {
        return (
            <div>
                <Map onClick={this._onMapClick} crs={L.CRS.Simple} zoomDelta={0.2} zoomSnap={0} minZoom={-2.15} maxZoom={1} bounds={bounds} style={{ height: this.props.height ? this.props.height : "80vh", width: "100%", backgroundColor: "#cdcdcd" }}>
                    <ImageOverlay
                        bounds={bounds}
                        url={map}
                    />
                    {this.props.waypoints.map((waypoint) => 
                        <Marker onClick={this._onMarkerClick} icon={icons[waypoint.icon ? waypoint.icon : 0]} key={waypoint._id} id={waypoint._id} name={waypoint.name} position={[waypoint.point[1]/0.05, waypoint.point[0]/0.05]}>
                            {this.props.showPopup ? <Popup>
                                <span>{waypoint.name ? waypoint.name : 'unknown'}</span>
                            </Popup> : null}
                        </Marker>
                    )}
                    {this.props.robotPose ? 
                        <Marker icon={robotPoseIcon} position={[this.robot_pose[1]/0.05, this.robot_pose[0]/0.05]}/> 
                    : null}
                    {this.props.showPath ? <Polyline color="red" weight={3} opacity={0.8} lineJoin="round" positions={this.pointList(this.props.waypoints)} /> : null}
                </Map>
            </div>
        )
    }
}