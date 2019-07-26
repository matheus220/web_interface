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
}, { collection: 'waypoint' });

let Mission = new Schema({
    name: {
        type: String,
        unique: true
    },
    path: [{ type: Schema.Types.ObjectId, ref: 'Waypoint'}]
}, { collection: 'mission' });

let Input = new Schema({
    timestamp: {
        type: Date
    },
    items: [{
        item: {
            type: Schema.Types.ObjectId,
            refPath: 'items.model'
        },
        model: String
    }]
}, { collection: 'input' });

let Camera = new Schema({
    item_name: {
        type: String
    },
    data: {
        path: {
            type: String
        },
        image_name: {
            type: String
        }
    }
}, { collection: 'camera' });

let Robot = new Schema({
    item_name: {
        type: String
    },
    data: {
        battery_level: {
            type: Number
        },
        pose: {
            type: [Number]
        }
    }
}, { collection: 'robot' });

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
            type: Schema.Types.ObjectId,
            ref: 'Input'
        }
    }]
}, { collection: 'logmission' });

let Log = new Schema({
    date: {
        type: Date
    },
    levelno: {
        type: Number
    },
    levelname: {
        type: String
    },
    message: {
        type: String
    }
}, { collection: 'log' });

let Task = new Schema({
    mission: {
        type: Schema.Types.ObjectId,
        ref: 'Mission'
    },
    cron_expression: {
        type: String
    },
    human_readable: {
        type: String
    },
    date: {
        type: Date
    }
}, { collection: 'task' });

module.exports.Waypoint = mongoose.model('Waypoint', Waypoint);
module.exports.Mission = mongoose.model('Mission', Mission);
module.exports.LogMission = mongoose.model('LogMission', LogMission);
module.exports.Log = mongoose.model('Log', Log);
module.exports.Input = mongoose.model('Input', Input);
module.exports.Camera = mongoose.model('Camera', Camera);
module.exports.Robot = mongoose.model('Robot', Robot);
module.exports.Task = mongoose.model('Task', Task);