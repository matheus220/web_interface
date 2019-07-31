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

export default class ViewByDate extends Component {
    constructor(props) {
        super(props);

        var today = Moment();

        const options = {
            width: '100%',
            height: '80px',
            stack: false,
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
            started: false
        };

        this.fetchLogMissions = this.fetchLogMissions.bind(this);
        this.logMissionsList = this.logMissionsList.bind(this);
    }

    async fetchLogMissions() {
        var date = Moment(this.state.date);
        await axios.get('http://'+process.env.REACT_APP_SERVER_PATH+':4000/logmission/date/'+date.format("YYYY-MM-DD"))
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
                    logmissions: response.data
                }));  
            })
            .catch(function (error){
                console.log(error);
            })
    }

    componentWillMount() {
        this.fetchLogMissions();
        console.log('aqui', this.state.logmissions)
        var today = Moment();
        this.setState(prevState => ({
            items: [],
            options: {
                ...prevState.options,
                min: Moment(today.endOf('day')),
                max: Moment(today.startOf('day')),
                start: Moment(today.startOf('day')),
            }
        }));
    }

    componentDidMount() {

    }

    // componentWillMount() {
    //     var today = Moment();
    //     this.setState(prevState => ({
    //         items: [],
    //         options: {
    //             ...prevState.options,
    //             min: Moment().toDate(),
    //             max: Moment(today.endOf('day')),
    //             start: Moment().toDate()
    //         }
    //     }));
    //     console.log(this.state.items)
    //     console.log(this.state.options)
    // }

    selectHandler(props) {
        console.log(props.items)
    }

    logMissionsList(logmissions) {
        return logmissions.map(logmission => {
            let classColor = logmission.mode === 'patrol' ? 'red' : 'green';
            return({
                id: logmission._id,
                start: new Date(logmission.start_time),
                end: new Date(logmission.end_time),
                className: classColor,
                title: logmission.mode.charAt(0).toUpperCase() + logmission.mode.slice(1)
            })
        });
    }

    render() {
        console.log("Entrou")
        console.log(this.state.options)
        console.log(this.state.items)
        return (
            <div className="row">
                <div className="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-block">
                            <MapWaypoints waypoints={[]} robotPose={true} showPath={false} height={"53vh"}/>
                        </div>
                    </div>
                </div>
                <div  className="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-header">
                            <h5>Title</h5>
                        </div>
                        <div className="card-block" style={{paddingTop: "5px", minHeight: "400px"}}>
                            <ImageGallery defaultImage={'/error.jpg'} items={[{ original: '/error.jpg' }]} lazyLoad={false} showThumbnails={false} showPlayButton={false} showBullets={true}/>
                        </div>
                    </div>
                </div>
                <div className="col-md-12 col-xl-12">
                    <div className="card" style={{marginTop: "30px"}}>
                        <div className="card-header">
                            <h5>Map</h5>
                            <div className="card-header-right-text" style={{paddingTop: "8px"}}>
                                <DateTimePicker
                                    dropUp
                                    format='LL'
                                    max={new Date()}
                                    defaultValue={new Date()}
                                    time={false}
                                    value={this.state.date}
                                    onChange={date => {this.setState({ date },() => { this.fetchLogMissions(); }) }}
                                />
                            </div>
                        </div>
                        <div className="card-block" style={{paddingTop: "5px"}}>
                            <Timeline options={this.state.options} items={this.state.items} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
