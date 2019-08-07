const mongoose = require('mongoose');
const express = require("express");
const logRoutes = express.Router();
const auth = require('../../middleware/auth');

var Log = mongoose.model('Log');

// @route   GET api/log
// @desc    Get The Latest 10 Logs
// @access  Private
logRoutes.get('/', auth, (req, res) => {
    Log.find(
        function(err, log) {
            if (err) {
                console.log(err);
            } else {
                res.json(log);
            }
        }
    ).sort({ date: 'descending' })
    .limit(10);
});

module.exports = logRoutes;