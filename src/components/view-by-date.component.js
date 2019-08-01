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
            showCurrentTime: true,
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
            timestamp: null,
            waypointName: null
        };

        this.fetchLogMissions = this.fetchLogMissions.bind(this);
        this.logMissionsList = this.logMissionsList.bind(this);
        this.selectHandler = this.selectHandler.bind(this);
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.resetAll = this.resetAll.bind(this);
    }

    fetchLogMissions() {
        var date = Moment(this.state.date);
        axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':4000/logmission/date/'+date.format("YYYY-MM-DD"))
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

                var timelineMin = start.isBefore(min) ? start : min;
                var timelineMax = end.isAfter(max) ? end : max;

                var items = this.logMissionsList(response.data);

                this.setState(prevState => ({
                    logmissions: response.data,
                    items: items,
                    options: {
                        ...prevState.options,
                        min: timelineMin.toDate(),
                        max: timelineMax.toDate(),
                        start: timelineMin.toDate(),
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
        if(props.items.length) {
            this.resetAll();
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
                                return({ "camera_name": item.item.item_name, "image_name": item.item.data.image_name, "path": item.item.data.path, "timestamp": waypoint.input.timestamp});
                            });
                        }
                    }
                    return(waypoint);
                })
            } else {
                let traveledWaypoints = selectedMission.data;
                mapWaypoints = traveledWaypoints.map(waypoint => {
                    switch (waypoint.status) {
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
                    if(waypoint.hasOwnProperty('input')) {
                        waypoint.images = waypoint.input.items.filter(item => {
                            return(item.model === "Camera")
                        }).map(item => {
                            return({ "camera_name": item.item.item_name, "image_name": item.item.data.image_name, "path": item.item.data.path, "timestamp": waypoint.input.timestamp});
                        });
                    }
                    return(waypoint);
                });
            }
            this.setState({ selectedMission: selectedMission, mapWaypoints: mapWaypoints });
        } else {
            this.resetAll();
        }
    }

    resetAll() {
        this.setState({
            selectedMission: null,
            mapWaypoints: [],
            images: [{original: "/error.jpg"}],
            cameras: ["No waypoints selected"],
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
                start: new Date(logmission.start_time),
                end: new Date(logmission.end_time),
                className: logmission.mode
            })
        });
    }

    render() {
        let loaded = this.state.items !== null;
        let selected = this.state.selectedMission !== null;
        return (
            <div className="row">
                <div className="col-md-12 col-xl-12">
                    <div className="card" style={{marginBottom: "20px"}}>
                        <div className="card-header">
                            {selected ? <h5>Matheus</h5> : <h5>Gabi</h5>}
                            <div className="card-header-right-text" style={{paddingTop: "10px", maxWidth: "200px"}}>
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
                            <MapWaypoints waypoints={this.state.mapWaypoints} robotPose={false} onMarkerClick={this.onMarkerClick} showPath={false} height={"59vh"}/>
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Title</h5>
                        </div>
                        <div className="card-block" style={{paddingTop: "5px", minHeight: "400px"}}>
                            <ImageGallery onSlide={this.onSlide} defaultImage={"/error.jpg"} items={this.state.images} infinite={false} lazyLoad={true} showThumbnails={false} showPlayButton={false} showBullets={true}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
