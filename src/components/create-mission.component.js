import React, { Component } from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import axios from 'axios';
import MapWaypoints from "./map.component";
import './style-react.css';

const KeyCodes = {
    comma: 188,
    enter: 13,
};
  
const delimiters = [KeyCodes.comma, KeyCodes.enter];

export default class CreateMission extends Component {

    constructor(props) {
        super(props);

        this.onChangeMissionName = this.onChangeMissionName.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            name: '',
            waypoints: [],
            tags: [],
            suggestions: []
        }

        this.handleDelete = this.handleDelete.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.selectedWaypoints = this.selectedWaypoints.bind(this);
    }

    componentDidMount() {
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':4000/waypoint/')
            .then(response => {
                let suggestions = response.data.map(
                    (waypoint) => {
                        return {id: waypoint._id, text: waypoint.name}
                    }
                )
                this.setState({
                    waypoints: response.data,
                    suggestions: suggestions
                });
            })
            .catch(function (error){
                console.log(error);
            })
    }

    handleDelete(i) {
        const { tags } = this.state;
        const {waypoints} = this.state;
        if (tags.length > 0) {
            var waypointIndex = waypoints.findIndex((wp => wp._id === tags[i].id));
            if (waypointIndex !== -1 ) {
                waypoints[waypointIndex].icon = 0;
                this.setState({
                    waypoints: waypoints,
                    tags: tags.filter((tag, index) => index !== i),
                });
            }
        }
    }

    handleAddition(tag) {
        const {waypoints} = this.state;
        var waypointIndex = waypoints.findIndex((wp => wp._id === tag.id));
        if (waypointIndex !== -1 ) {
            waypoints[waypointIndex].icon = 1;
            this.setState({
                waypoints: waypoints,
                tags: [...this.state.tags, tag]
            });
        }
    }

    handleDrag(tag, currPos, newPos) {
        const tags = [...this.state.tags];
        const newTags = tags.slice();

        newTags.splice(currPos, 1);
        newTags.splice(newPos, 0, tag);

        // re-render
        this.setState({ tags: newTags });
    }

    onChangeMissionName(e) {
        this.setState({
            name: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        let path = this.state.tags.map(tag => {return tag.id});

        if(path.length) {
            const newMission = {
                name: this.state.name,
                path: path
            };
    
            axios.post('http://'+process.env.REACT_APP_SERVER_PATH+':4000/mission/add', newMission)
                .then(res => {
                    this.setState({
                        name: '',
                        tags: []
                    })
            
                    this.props.history.push('/missions');
                });
        }
    }

    onCancel = (e) => {
        console.log(`Cancel submitted:`);

        this.setState({
            name: '',
            path: []
        })

        const path = '/missions';
        this.props.history.push(path);
    }

    onMarkerClick = (obj) => {
        let tag = {id: obj.target.options.id, text: obj.target.options.name};
        let index = this.state.tags.findIndex((t => t.id === tag.id));
        if ( index !== -1 ){
            this.handleDelete(index)
        }
        else {
            this.handleAddition(tag)
        }
    }

    selectedWaypoints() {
        return this.state.tags.map(tag => {return this.state.waypoints.filter(waypoint => waypoint._id === tag.id)[0]});
    }

    render() {
        return (
            <div className="row">
                <div className="col-md-12 col-xl-9">
                    <div className="card">
                        <div className="card-block">
                            <MapWaypoints onMarkerClick={this.onMarkerClick} polyline={this.selectedWaypoints()} waypoints={this.state.waypoints} showPopup={false} showPath={false} />
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-3 d-flex">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div className="col-12 col-sm-6" style={{paddingLeft: "0px"}}>
                                <h5>Create Mission</h5>
                            </div>
                        </div>
                        <div className="card-block">
                            <form onSubmit={this.onSubmit}>
                                <div className="form-group"> 
                                    <label>Name: </label>
                                    <input  type="text"
                                            placeholder="Mission Name"
                                            className="form-control"
                                            value={this.state.name}
                                            onChange={this.onChangeMissionName}
                                            required
                                            />
                                </div>
                                <div>
                                    <label>Path: </label>
                                    <div className="d-flex align-content-around flex-wrap">
                                        <ReactTags tags={this.state.tags}
                                            suggestions={this.state.suggestions}
                                            handleDelete={this.handleDelete}
                                            handleAddition={this.handleAddition}
                                            handleDrag={this.handleDrag}
                                            delimiters={delimiters} 
                                            placeholder="Add waypoint"/>
                                    </div>
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