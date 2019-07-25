const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Waypoint = new Schema({
    name: {
        type: String
    },
    point: {
        type: [Number]
    },
    map: {
        type: String
    },
    rack: {
        type: String
    }
});

let Mission = new Schema({
    name: {
        type: String,
        unique: true
    },
    path: [{ type: Schema.Types.ObjectId, ref: 'Waypoint'}]
});

let LogMission = new Schema({
    mode: {
        type: String
    },
    start_time: {
        type: Date
    },
    end_time: {
        type: Date
    },
    status: {
        type: String
    },
    mission_id: {
        type: Schema.Types.ObjectId, 
        ref: 'Mission'
    },
    current_waypoint: {
        type: Number
    },
    scheduled: {
        type: Boolean
    },
    data: [{
        waypoint: {
            type: Schema.Types.ObjectId,
            ref: 'Waypoint'
        },
        status: {
            type: String
        },
        input: {
            type: [String]
        }
    }]
});

module.exports.Waypoint = mongoose.model('Waypoint', Waypoint);
module.exports.Mission = mongoose.model('Mission', Mission);
module.exports.LogMission = mongoose.model('LogMission', LogMission);