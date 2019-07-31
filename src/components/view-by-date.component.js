import React, { Component } from "react";
import axios from 'axios';
import MapWaypoints from "./map.component";
import ImageGallery from 'react-image-gallery';
import Moment from 'moment'
import momentLocalizer from 'react-widgets-moment';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import Timeline from 'react-visjs-timeline'


Moment.locale('en')
momentLocalizer()

const options = {
    width: '100%',
    height: '120px',
    stack: false,
    showMajorLabels: true,
    showCurrentTime: true,
    zoomMin: 900000,
    zoomMax: 90000000,
    max: new Date(),
    min: new Date("2019-07-29T03:24:00"),
    type: 'range',
    selectable: false,
    format: {
      minorLabels: {
        minute: 'h:mma',
        hour: 'ha'
      }
    }
}

const items = [
    {
        id: 0,
        start: new Date("2019-07-31T00:00:00"),
        end: new Date("2019-07-31T01:00:00"),  // end is optional
        content: 'Trajectory A',
        className: "red",
        title: "Matheus"
    },
    {
        id: 1,
        start: new Date("2019-07-30T22:00:00"),
        end: new Date("2019-07-30T23:00:00"),  // end is optional
        content: 'Trajectory A',
        className: "green"
    },
]

export default class ViewByDate extends Component {
    constructor(props) {
        super(props);
        

        this.state = {
            date: new Date(),
        };
    }

    componentDidMount() {

    }

    clickHandler(props) {
        console.log(props)
    }

    render() {

        return (
            <div className="row">
                <div className="col-md-12 col-xl-6">
                    <div className="card">
                        <div className="card-block">
                            <MapWaypoints waypoints={[]} robotPose={true} showPath={false} height={"58vh"}/>
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
                    <div className="card" style={{marginTop: "20px"}}>
                        <div className="card-header">
                            <h5>Map</h5>
                        </div>
                        <div className="card-block" style={{paddingTop: "5px"}}>
                            <div className="row">
                                <div className="col-md-12 col-xl-2">
                                    <DateTimePicker
                                        dropUp
                                        format='LL'
                                        max={new Date()}
                                        defaultValue={new Date()}
                                        time={false}
                                        value={this.state.date}
                                        onChange={date => this.setState({ date })}
                                    />
                                </div>
                                <div className="col-md-12 col-xl-10">
                                    <Timeline
                                        options={options}
                                        items={items}
                                        clickHandler={this.clickHandler}
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
