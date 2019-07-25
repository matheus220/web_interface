const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const waypointRoutes = express.Router();
const missionRoutes = express.Router();
const logmissionRoutes = express.Router();
const logRoutes = express.Router();
const PORT = 4000;

let Models = require('./mongo.model');
let Waypoint = Models.Waypoint;
let Mission = Models.Mission;
let LogMission = Models.LogMission;
let Log = Models.Log;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/robotic', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

waypointRoutes.route('/').get(function(req, res) {
    Waypoint.find(function(err, waypoints) {
        if (err) {
            console.log(err);
        } else {
            res.json(waypoints);
        }
    });
});

waypointRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Waypoint.findById(id, function(err, todo) {
        res.json(todo);
    });
});

waypointRoutes.route('/delete/:id').post(function(req, res) {
    Waypoint.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.send(err);
        else
            res.json({ message: 'Waypoint Deleted!'});
    });
});

waypointRoutes.route('/update/:id').post(function(req, res) {
    Waypoint.findById(req.params.id, function(err, todo) {
        if (!todo)
            res.status(404).send("data is not found");
        else
            todo.todo_description = req.body.todo_description;
            todo.todo_responsible = req.body.todo_responsible;
            todo.todo_priority = req.body.todo_priority;
            todo.todo_completed = req.body.todo_completed;

            todo.save().then(todo => {
                res.json('Todo updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

waypointRoutes.route('/add').post(function(req, res) {
    let waypoint = new Waypoint(req.body);
    waypoint.save()
        .then(todo => {
            res.status(200).json({'waypoint': 'waypoint added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new waypoint failed');
        });
});

app.use('/waypoint', waypointRoutes);

missionRoutes.route('/').get(function(req, res) {
    Mission.find(function(err, mission) {
        if (err) {
            console.log(err);
        } else {
            res.json(mission);
        }
    }).populate('path');
});

missionRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Mission.findById(id, function(err, todo) {
        res.json(todo);
    });
});

missionRoutes.route('/update/:id').post(function(req, res) {
    Mission.findById(req.params.id, function(err, todo) {
        if (!todo)
            res.status(404).send("data is not found");
        else
            todo.todo_description = req.body.todo_description;
            todo.todo_responsible = req.body.todo_responsible;
            todo.todo_priority = req.body.todo_priority;
            todo.todo_completed = req.body.todo_completed;

            todo.save().then(todo => {
                res.json('Todo updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

missionRoutes.route('/add').post(function(req, res) {
    let mission = new Mission(req.body);
    mission.save()
        .then(mission => {
            res.status(200).json({'mission': 'mission added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new mission failed');
        });
});

missionRoutes.route('/delete/:id').post(function(req, res) {
    Mission.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.send(err);
        else
            res.json({ message: 'Mission Deleted!'});
    });
});

app.use('/mission', missionRoutes);

logmissionRoutes.route('/').get(function(req, res) {
    LogMission.findOne(
        { mode: 'patrol' },
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

app.use('/logmission', logmissionRoutes);

logRoutes.route('/').get(function(req, res) {
    Log.find(
        function(err, log) {
            if (err) {
                console.log(err);
            } else {
                res.json(log);
            }
        }
    ).sort({ date: 'descending' });
});

app.use('/log', logRoutes);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});