const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const exec = require('child_process').exec;
const later = require('later');
const waypointRoutes = express.Router();
const missionRoutes = express.Router();
const logmissionRoutes = express.Router();
const logRoutes = express.Router();
const scheduleRoutes = express.Router();
const PORT = 4000;

later.date.localTime();
let filePath = "/tmp/crontabFile.txt";
let Models = require('./mongo.model');
let Waypoint = Models.Waypoint;
let Mission = Models.Mission;
let LogMission = Models.LogMission;
let Log = Models.Log;
let Task = Models.Task;


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
    ).sort({ date: 'descending' })
    .limit(10);
});

app.use('/log', logRoutes);

function createRosPubCommand(task_id, cron_expression, mission_id) {
    return("# " + task_id + "\n" + cron_expression  + " source /opt/ros/kinetic/setup.bash && rostopic pub -1 /change_mode std_msgs/String \"data: '{\\\"timestamp\\\": \\\"$(date +\"\\%d\\%m\\%Y\\%H\\%M\\%S\\%3N\")\\\", \\\"mode\\\": \\\"patrol\\\", \\\"scheduled\\\": \\\"true\\\", \\\"mission_id\\\": \\\"" + mission_id + "\\\"}'\"\n");
}

function updateFile(){
    Task.find({'active': true},
        function(err, tasks) {
            if (err) {
                console.log(err);
            } else {
                let message = "########## DO NOT WRITE BELOW THIS LINE ##########";
                let setup = [message + "\n\nSHELL=/bin/bash\n"];
                let taskList = tasks.map(task => {
                    return (createRosPubCommand(task._id, task.cron_expression, task.mission_id));
                });
                let toWrite = setup.concat(taskList);

                exec("crontab -l > /tmp/crontab_tmp_copy.txt", function(err, stdout, stderr) {
                    if (err) throw err;
                    fs.readFile('/tmp/crontab_tmp_copy.txt', {encoding: 'utf-8'}, function(err, data) {
                        if (err) throw error;
                    
                        let dataArray = data.split('\n'); // convert file data in an array
                        const searchLine = message; // we are looking for a line, contains, key word 'user1' in the file
                        let index = dataArray.indexOf(searchLine);
    
                        console.log(data)
    
                        if(index !== -1) {
                            dataArray.splice(index);
                        }
    
                        const updatedData = dataArray.concat(toWrite);
                        
                        fs.writeFile(filePath, updatedData.join("\n"), (err) => {
                            if (err) throw err;
                            console.log ('Successfully updated the file data');
                        });
    
                        exec("crontab " + filePath, function(err, stdout, stderr) {
                            if (err) throw err;
                            console.log('Crontab updated!');
                        });
                    
                    });
                });
            }
        }
    ).sort({ date: 'descending' });
}

scheduleRoutes.route('/').get(function(req, res) {
    Task.find().sort({ date: 'descending' }).lean().exec(
        function(err, tasks) {
            if (err) {
                console.log(err);
            } else {
                var t = tasks.map(task => {
                    var cron = later.parse.cron(task.cron_expression);
                    task['next'] = later.schedule(cron).next(1);
                    task['last'] = later.schedule(cron).prev(1);
                    return(task);
                });
                res.json(t);
            }
        }
    );
});

scheduleRoutes.route('/add').post(function(req, res) {
    let task = new Task(req.body);
    task.save()
        .then(t => {
            res.status(200).json({'task': 'task added successfully'});
            updateFile();
        })
        .catch(err => {
            res.status(400).send('adding new task failed');
        });
});

scheduleRoutes.route('/update/:id').post(function(req, res) {
    Task.findById(req.params.id, function(err, task) {
        if (!task)
            res.status(404).send("data is not found");
        else
            task.mission_id = req.body.mission_id;
            task.mission_name = req.body.mission_name;
            task.cron_expression = req.body.cron_expression;
            task.date = req.body.date;
            task.active = req.body.active;

            task.save().then(t => {
                res.json('Task updated!');
                updateFile();
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

scheduleRoutes.route('/delete/:id').post(function(req, res) {
    Task.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.send(err);
        } else {
            res.json({ message: 'Task Deleted!'});
            updateFile();
        }
    });
});

app.use('/task', scheduleRoutes);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});