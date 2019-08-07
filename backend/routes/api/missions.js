const mongoose = require('mongoose');
const express = require("express");
const missionRoutes = express.Router();
const auth = require('../../middleware/auth');

var Mission = mongoose.model('Mission');

// @route   GET api/mission
// @desc    Get All Missions
// @access  Private
missionRoutes.get('/', auth, (req, res) => {
    Mission.find(function(err, mission) {
        if (err) {
            console.log(err);
        } else {
            res.json(mission);
        }
    }).populate('path');
});

// @route   GET api/mission/:id
// @desc    Get Mission by ID
// @access  Private
missionRoutes.get('/:id', auth, (req, res) => {
    let id = req.params.id;
    Mission.findById(id, function(err, todo) {
        res.json(todo);
    });
});

// @route   POST api/mission/update/:id
// @desc    Update A Mission
// @access  Private
missionRoutes.post('/update/:id', auth, (req, res) => {
    Mission.findById(req.params.id, function(err, mission) {
        if (!mission)
            res.status(404).send("mission is not found");
        else
            mission.name = req.body.name;
            mission.path = req.body.path;

            mission.save().then(m => {
                res.json('Mission updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

// @route   POST api/mission/add
// @desc    Create An Mission
// @access  Private
missionRoutes.post('/add', auth, (req, res) => {
    let mission = new Mission(req.body);
    mission.save()
        .then(mission => {
            res.status(200).json({'mission': 'mission added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new mission failed');
        });
});

// @route   POST api/mission/delete/:id
// @desc    Delete A Mission
// @access  Private
missionRoutes.post('/delete/:id', auth, (req, res) => {
    Mission.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.send(err);
        else
            res.json({ message: 'Mission Deleted!'});
    });
});

module.exports = missionRoutes;