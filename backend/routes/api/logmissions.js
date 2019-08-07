const mongoose = require('mongoose');
const express = require("express");
const moment = require('moment');
const logmissionRoutes = express.Router();
const auth = require('../../middleware/auth');

var LogMission = mongoose.model('LogMission');

// @route   GET api/logmission
// @desc    Get All LogMissions
// @access  Private
logmissionRoutes.get('/', auth, (req, res) => {
    LogMission.find(
        function(err, logmission) {
            if (err) {
                console.log(err);
            } else {
                res.json(logmission);
        }
    })
    .sort('-start_time')
    .populate({ path: 'mission_id', populate: { path: 'path' } })
    .populate('data.waypoint')
    .populate({ path: 'data.input', populate: { path: 'items.item' } });
});

// @route   GET api/logmission/last/:mode
// @desc    Get Last LogMission Of An Mode
// @access  Private
logmissionRoutes.get('/last/:mode', auth, (req, res) => {
    LogMission.findOne(
        { mode: req.params.mode },
        function(err, logmission) {
            if (err) {
                console.log(err);
            } else {
                res.json(logmission);
        }
    })
    .sort('-start_time')
    .populate({ path: 'mission_id', populate: { path: 'path' } })
    .populate('data.waypoint')
    .populate({ path: 'data.input', populate: { path: 'items.item' } });
});

// @route   GET api/logmission/date/:day
// @desc    Get All LogMissions Of An Day
// @access  Private
logmissionRoutes.get('/date/:day', auth, (req, res) => {
    var date = moment(moment.utc(req.params.day), "YYYY-MM-DD");
    var start = date.startOf('day').toDate();
    var end = date.endOf('day').toDate();
    LogMission.find({
        $and: [
            {
                mode: { $in: ['patrol', 'assistance'] }
            },
            {
                start_time: { $exists: true }
            },
            {
                end_time: { $exists: true }
            },
            {
                $or: [
                    { end_time: { $gte: start, $lte: end } },
                    { start_time: { $gte: start, $lte: end } }
                ]
            }
        ]},
        function(err, logmission) {
            if (err) {
                console.log(err);
            } else {
                res.json(logmission);
        }
    })
    .sort('-start_time')
    .populate({ path: 'mission_id', populate: { path: 'path' } })
    .populate('data.waypoint')
    .populate({ path: 'data.input', populate: { path: 'items.item' } });
});

module.exports = logmissionRoutes;