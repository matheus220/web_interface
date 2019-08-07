const mongoose = require('mongoose');
const express = require("express");
const waypointRoutes = express.Router();
const auth = require('../../middleware/auth');

var Waypoint = mongoose.model('Waypoint');

// @route   GET api/waypoint
// @desc    Get All Waypoints
// @access  Private
waypointRoutes.get('/', auth, (req, res) => {
    Waypoint.find(function(err, waypoints) {
        if (err) {
            console.log(err);
        } else {
            res.json(waypoints);
        }
    });
});

// @route   GET api/waypoint/:id
// @desc    Get Waypoint by ID
// @access  Private
waypointRoutes.get('/:id', auth, (req, res) => {
    let id = req.params.id;
    Waypoint.findById(id, function(err, wp) {
        res.json(wp);
    });
});

// @route   POST api/waypoint/add
// @desc    Create An Waypoint
// @access  Private
waypointRoutes.post('/add', auth, (req, res) => {
    let waypoint = new Waypoint(req.body);
    waypoint.save()
        .then(todo => {
            res.status(200).json({'waypoint': 'waypoint added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new waypoint failed');
        });
});

// @route   POST api/waypoint/update/:id
// @desc    Update A Waypoint
// @access  Private
waypointRoutes.post('/update/:id', auth, (req, res) => {
    Waypoint.findById(req.params.id, function(err, waypoint) {
        if (!waypoint)
            res.status(404).send("Waypoint is not found");
        else
            waypoint.name = req.body.name;
            waypoint.point = req.body.point;
            waypoint.map = req.body.map;
            waypoint.group = req.body.group;

            waypoint.save().then(wp => {
                res.json('Waypoint updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

// @route   POST api/waypoint/delete/:id
// @desc    Delete A Waypoint
// @access  Private
waypointRoutes.post('/delete/:id', auth, (req, res) => {
    Waypoint.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.send(err);
        else
            res.json({ message: 'Waypoint Deleted!'});
    });
});

module.exports = waypointRoutes;