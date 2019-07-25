import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import "bootstrap/dist/css/bootstrap.min.css";

import CreateTodo from "./components/create-todo.component";
import EditTodo from "./components/edit-todo.component";
import TodosList from "./components/todos-list.component";
import Waypoints from "./components/waypoints.component";
import Missions from "./components/missions.component";
import Navigation from "./components/navigation.component";
import CreateWaypoint from "./components/create-waypoint.component";
import CreateMission from "./components/create-mission.component";

import logo from "./logo.png";

export default class App extends Component {
  render() {
    return (
      <Router>
        <div className="pcoded-wrapper">
          <nav className="pcoded-navbar navbar navbar-expand-lg navbar-dark bg-dark">
            <a class="navbar-brand" href="https://laborange.fr/" target="_blank" rel="noopener noreferrer">
              <img src={logo} width="30" height="30" alt="https://laborange.fr/" />
            </a>
            <Link to="/" className="navbar-brand">Data Center Supervision</Link>
            <div className="collpase navbar-collapse">
              <ul className="navbar-nav mr-auto">
                <li className="navbar-item">
                  <Link to="/" className="nav-link">Todos</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/create" className="nav-link">Create Todo</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/navigation" className="nav-link">Navigation</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/waypoints" className="nav-link">Waypoints</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/missions" className="nav-link">Missions</Link>
                </li>
              </ul>
            </div>
          </nav>
          <div className="pcoded-content">
            <div className="main-bodyt">
              <div className="page-wrapper">
                <div className="page-body">
                  <Switch>
                    <Route path="/" exact component={TodosList} />
                    <Route path="/edit/:id" component={EditTodo} />
                    <Route path="/create" component={CreateTodo} />
                    <Route path="/waypoints" component={Waypoints} />
                    <Route path="/create_waypoint" component={CreateWaypoint} />
                    <Route path="/missions" component={Missions} />
                    <Route path="/create_mission" component={CreateMission} />
                    <Route path="/navigation" component={Navigation} />
                  </Switch>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}