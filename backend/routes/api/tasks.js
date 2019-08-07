const mongoose = require('mongoose');
const express = require("express");
const scheduleRoutes = express.Router();
const fs = require('fs');
const exec = require('child_process').exec;
const auth = require('../../middleware/auth');
const later = require('later');

later.date.localTime();

let filePath = "/tmp/crontabFile.txt";
var Task = mongoose.model('Task');

function createRosPubCommand(task_id, cron_expression, mission_id) {
    return("# " + task_id + "\n" + cron_expression  + " source /opt/ros/kinetic/setup.bash && rostopic pub -1 /change_mode std_msgs/String \"data: '{\\\"timestamp\\\": \\\"$(date +\"\\%d\\%m\\%Y\\%H\\%M\\%S\\%3N\")\\\", \\\"mode\\\": \\\"scheduled_patrol\\\", \\\"scheduled\\\": \\\"true\\\", \\\"mission_id\\\": \\\"" + mission_id + "\\\"}'\"\n");
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
                    if (err) exec("touch /tmp/crontab_tmp_copy.txt");
                    fs.readFile('/tmp/crontab_tmp_copy.txt', {encoding: 'utf-8'}, function(err, data) {
                        if (err) throw error;
                    
                        let dataArray = data.split('\n'); // convert file data in an array
                        const searchLine = message; // we are looking for a line, contains, key word 'user1' in the file
                        let index = dataArray.indexOf(searchLine);
        
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

// @route   GET api/task
// @desc    Get All Tasks
// @access  Private
scheduleRoutes.get('/', auth, (req, res) => {
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

// @route   POST api/task/add
// @desc    Create A Task
// @access  Private
scheduleRoutes.post('/add', auth, (req, res) => {
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

// @route   POST api/task/update/:id
// @desc    Update A Task
// @access  Private
scheduleRoutes.post('/update/:id', auth, (req, res) => {
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

// @route   POST api/task/delete/:id
// @desc    Delete A Task
// @access  Private
scheduleRoutes.post('/delete/:id', auth, (req, res) => {
    Task.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.send(err);
        } else {
            res.json({ message: 'Task Deleted!'});
            updateFile();
        }
    });
});

module.exports = scheduleRoutes;