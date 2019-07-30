import React, { Component } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import MapWaypoints from "./map.component";

const mapName = "WD_WA_WB"

export default  class CreateWaypoints extends Component {

    constructor(props) {
        super(props);

        this.onChangeWaypointName = this.onChangeWaypointName.bind(this);
        this.onChangeWaypointPoint = this.onChangeWaypointPoint.bind(this);
        this.onChangeWaypointMap = this.onChangeWaypointMap.bind(this);
        this.onChangeWaypointGroup = this.onChangeWaypointGroup.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            _id: 0,
            name: '',
            point: [0.0, 0.0, 0.0],
            map: mapName,
            group: '',
            icon: 0
        }
    }

    onChangeWaypointName(e) {
        this.setState({
            name: e.target.value
        });
    }

    onChangeWaypointPoint(e) {
        this.setState({
            point: e.target.value
        });
    }

    onChangeWaypointMap(e) {
        this.setState({
            map: e.target.value
        });
    }

    onChangeWaypointGroup(e) {
        this.setState({
            group: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault();
             
        const newWaypoint = {
            name: this.state.name,
            point: this.state.point,
            map: this.state.map,
            group: this.state.group
        };

        axios.post('http://localhost:4000/waypoint/add', newWaypoint)
            .then(res => console.log(res.data));

        this.setState({
            name: '',
            point: [],
            map: mapName,
            group: ''
        })
        
        this.props.history.push('/waypoints');
    }

    onCancel = (e: Object) => {
        console.log(`Cancel submitted:`);

        this.setState({
            name: '',
            point: [],
            map: mapName,
            group: ''
        })

        this.props.history.push('/waypoints');
    }

    addMarker = (e: Object) => {
        this.setState({
          point: [(0.05*e.latlng.lng).toFixed(2), (0.05*e.latlng.lat).toFixed(2), (0.0).toFixed(2)]
        })
    }

    render() {
        return (
            <div className="row">
                <div className="col-md-12 col-xl-9">
                    <div className="card">
                        <div className="card-block">
                            <MapWaypoints onMapClick={this.addMarker} waypoints={[this.state]} showPath={false} />
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-3 d-flex">
                    <div className="card">
                        <div className="card-header">
                            <h5>Create Waypoint</h5>
                        </div>
                        <div className="card-block">
                            <form onSubmit={this.onSubmit}>
                                <div className="form-group"> 
                                    <label>Name: </label>
                                    <input  type="text"
                                            className="form-control"
                                            value={this.state.name}
                                            onChange={this.onChangeWaypointName}
                                            required
                                            />
                                </div>
                                <div className="form-group">
                                    <label>Point: </label>
                                    <input 
                                            type="text" 
                                            className="form-control"
                                            value={"[ " + this.state.point[0] + " , " + this.state.point[1] + " , " + this.state.point[2] + " ]"}
                                            onChange={this.onChangeWaypointPoint}
                                            required
                                            disabled
                                            />
                                </div>
                                <div className="form-group">
                                    <label>Map: </label>
                                    <input 
                                            type="text" 
                                            className="form-control"
                                            value={this.state.map}
                                            onChange={this.onChangeWaypointMap}
                                            required
                                            />
                                </div>
                                <div className="form-group">
                                    <label>Group: </label>
                                    <input 
                                            type="text" 
                                            className="form-control"
                                            value={this.state.group}
                                            onChange={this.onChangeWaypointGroup}
                                            required
                                            />
                                </div>

                                <div className="buttons-group form-group d-flex justify-content-around">
                                    <input onClick={this.onCancel} type="button" value="Cancel" className="btn btn-danger" />
                                    <input type="submit" value="Create" className="btn btn-primary" />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
