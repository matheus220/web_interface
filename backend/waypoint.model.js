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

module.exports = mongoose.model('Waypoint', Waypoint);