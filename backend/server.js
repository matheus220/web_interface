const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require("passport");

const users = require("./routes/api/users");
const waypoints = require("./routes/api/waypoints");
const missions = require("./routes/api/missions");
const logmissions = require("./routes/api/logmissions");
const logs = require("./routes/api/logs");
const tasks = require("./routes/api/tasks");

app.use(cors());

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to Mongo
mongoose
  .connect(db, { 
    useNewUrlParser: true,
    useCreateIndex: true
  }) // Adding new mongo url parser
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Routes
app.use("/api/users", users);
app.use('/api/waypoint', waypoints);
app.use('/api/mission', missions);
app.use('/api/logmission', logmissions);
app.use('/api/log', logs);
app.use('/api/task', tasks);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, './../build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname+'./../build/index.html'));
    });
}

const port = process.env.PORT || 4000;

app.listen(port, function() {
    console.log("Server started on port: " + port);
});