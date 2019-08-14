import React, { Component } from "react";
import axios from 'axios';
import MapWaypoints from "./map.component";
import ImageGallery from 'react-image-gallery';
import Moment from 'moment'
import momentLocalizer from 'react-widgets-moment';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import Timeline from 'react-visjs-timeline';

Moment.locale('en')
momentLocalizer()

function FormatDate(date) {
    return(date.slice(5,-7))
}

export default class ViewByDate extends Component {
    constructor(props) {
        super(props);

        var today = Moment();

        const options = {
            width: '100%',
            height: '80px',
            stack: false,
            orientation: "top",
            showMajorLabels: false,
            showCurrentTime: false,
            zoomMin: 900000,
            zoomMax: 90000000,
            max: Moment(today.endOf('day')),
            min: Moment(today.startOf('day')),
            start: Moment(today.startOf('day')),
            type: 'range',
            selectable: true,
            format: {
                minorLabels: {
                    minute: 'H:mm',
                    hour: 'H'
                }
            },
            moment: function(date) {
                return Moment(date).utc();
            }
        }

        this.state = {
            date: new Date(),
            logmissions: null,
            items: null,
            options: options,
            selectedMission: null,
            mapWaypoints: [],
            images: [{original: "/error.jpg"}],
            cameras: ["No waypoints selected"],
            currentCameraIndex: 0,
            timestamp: null,
            waypointName: null
        };

        this.fetchLogMissions = this.fetchLogMissions.bind(this);
        this.logMissionsList = this.logMissionsList.bind(this);
        this.selectHandler = this.selectHandler.bind(this);
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.resetAll = this.resetAll.bind(this);
        this.onSlide = this.onSlide.bind(this);
    }

    fetchLogMissions() {
        var date = Moment(this.state.date);
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':'+process.env.REACT_APP_SERVER_PORT+'/api/logmission/date/'+date.format("YYYY-MM-DD"))
            .then(response => {
                var start = Moment(date.startOf('day').toDate());
                var end = Moment(date.endOf('day').toDate());

                var min = null;
                var max = null;

                if(response.data.length) {
                    min = Moment(response.data[response.data.length-1].start_time);
                    max = Moment(response.data[0].end_time);
                } else {
                    min = start;
                    max = end;
                }

                var timelineMin_ = start.isBefore(min) ? start : min;
                var timelineMax_ = end.isAfter(max) ? end : max;

                var timelineMin = Moment(timelineMin_).format("YYYY-MM-DDTHH:mm:ss.SSSS");
                var timelineMax = Moment(timelineMax_).format("YYYY-MM-DDTHH:mm:ss.SSSS");

                var items = this.logMissionsList(response.data);

                this.setState(prevState => ({
                    logmissions: response.data,
                    items: items,
                    options: {
                        ...prevState.options,
                        min: Moment.utc(timelineMin),
                        max: Moment.utc(timelineMax),
                        start: Moment.utc(timelineMin),
                    }
                }));
                this.resetAll();
            })
            .catch(function (error){
                console.log(error);
            })
    }

    componentDidMount() {
        this.fetchLogMissions();
    }

    selectHandler(props) {
        this.resetAll();
        if(props.items.length) {
            var selectedMission = this.state.logmissions.filter(logmission => logmission._id === props.items[0])[0]
            var mapWaypoints = [];
            if (selectedMission.mode === 'patrol') {
                let missionWaypoints = selectedMission.mission_id.path;
                let traveledWaypoints = selectedMission.data;
                mapWaypoints = missionWaypoints.map(waypoint => {
                    let index = traveledWaypoints.findIndex(measure => measure.waypoint._id === waypoint._id);
                    waypoint.icon = 5;
                    if (index !== -1) {
                        switch (traveledWaypoints[index].status) {
                            case 'succeeded':
                                waypoint.icon = 1;
                                break;
                            case 'active':
                                waypoint.icon = 3;
                                break;
                            case 'aborted':
                                waypoint.icon = 2;
                                break;
                            default:
                                waypoint.icon = 5;
                        }
                        if(traveledWaypoints[index].hasOwnProperty('input')) {
                            waypoint.images = traveledWaypoints[index].input.items.filter(item => {
                                return(item.model === "Camera")
                            }).map(item => {
                                return({ "camera_name": item.item.item_name, "image_name": item.item.data.image_name, "path": item.item.data.path, "timestamp": traveledWaypoints[index].input.timestamp});
                            });
                        } else {
                            waypoint.icon = 2;
                        }
                    }
                    return(waypoint);
                })
            } else {
                let traveledWaypoints = selectedMission.data;
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
            }
            this.setState({ selectedMission: selectedMission, mapWaypoints: mapWaypoints });
        }
    }

    resetAll() {
        this.setState({
            selectedMission: null,
            mapWaypoints: [],
            images: [{original: "/error.jpg"}],
            cameras: ["No waypoints selected"],
            currentCameraIndex: 0,
            timestamp: null,
            waypointName: null
        });
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
                waypointName: waypoint.name
            });
        }
    }

    logMissionsList(logmissions) {
        return logmissions.map(logmission => {
            return({
                id: logmission._id,
                start: Moment(logmission.start_time),
                end: Moment(logmission.end_time),
                className: logmission.mode
            })
        });
    }

    onSlide(currentIndex) {
        this.setState({
            currentCameraIndex: currentIndex
        });
    }

    render() {
        let loaded = this.state.items !== null;
        let selected = this.state.selectedMission !== null;
        let missionName = "Assistance";
        if (selected) {
            let selectedMission = this.state.selectedMission;
            if (selectedMission.mode === 'patrol') {
                missionName = selectedMission.mission_id.name
            }
        }
        return (
            <div className="row">
                <div className="col-md-12 col-xl-12">
                    <div className="card" style={{marginBottom: "30px"}}>
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div className="col-12 col-sm-6" style={{paddingLeft: "0px"}}>
                                {selected ?
                                <div className="title-div">
                                    <h5>{missionName}  | </h5><span style={{color: '#7e7e7e', fontSize:"0.9em"}}> {this.state.selectedMission.status.toUpperCase()}</span><br/>
                                    <span className="caption-text" >Made from {Moment(this.state.selectedMission.start_time).format("HH:mm")} to {Moment(this.state.selectedMission.end_time).format("HH:mm")} </span>
                                </div> : 
                                <h5>No missions selected</h5>
                                }
                            </div>
                            <div className="col-12 col-sm-6 d-flex justify-content-end" style={{paddingRight: "0px", verticalAlign: "center"}}>
                                <DateTimePicker
                                    format='LL'
                                    max={new Date()}
                                    defaultValue={new Date()}
                                    time={false}
                                    value={this.state.date}
                                    onChange={date => {this.setState({ date: date }, () => { this.fetchLogMissions(); }) }}
                                />
                            </div>
                        </div>
                        <div className="card-block" style={{paddingTop: "5px"}}>
                            {loaded ? <Timeline selectHandler={this.selectHandler} options={this.state.options} items={this.state.items} /> : <h4>Loading...</h4> }
                        </div>
                    </div>
                </div>
                <div className="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-block">
                            <MapWaypoints waypoints={this.state.mapWaypoints} robotPose={false} onMarkerClick={this.onMarkerClick} showPath={false} height={"54.5vh"}/>
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                            { this.state.waypointName ?
                            <div className="col-12 col-sm-12" style={{paddingLeft: "0px"}}>
                                <h5>{this.state.cameras[this.state.currentCameraIndex]}  | </h5><span style={{color: '#7e7e7e', fontSize:"0.9em"}}> Waypoint {this.state.waypointName}</span><br/>
                                <span className="caption-text">Photo taken at {this.state.timestamp[this.state.currentCameraIndex]}</span>
                            </div> :
                            <div className="col-12 col-sm-12" style={{paddingLeft: "0px"}}>
                                <h5>{this.state.cameras[this.state.currentCameraIndex]}</h5>
                            </div>
                            }
                        </div>
                        <div className="card-block image-block">
                            <ImageGallery onSlide={this.onSlide} defaultImage={"/error.jpg"} items={this.state.images} infinite={false} lazyLoad={true} showThumbnails={false} showPlayButton={false} showBullets={true}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
