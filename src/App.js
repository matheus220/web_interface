import React, { Component } from "react";

import PropTypes from "prop-types";
import { connect } from "react-redux";

import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";

import { setCurrentUser, logoutUser } from "./actions/authActions";
import store from "./store";

import "bootstrap/dist/css/bootstrap.min.css";

import Login from "./components/login.component";
import AuthenticatedApp from "./components/authenticated-app.component";

// Check for token to keep user logged in
if (localStorage.jwtToken) {
    // Set auth token header auth
    const token = localStorage.jwtToken;
    setAuthToken(token);
    // Decode token and get user info and exp
    const decoded = jwt_decode(token);
    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));
    // Check for expired token
    const currentTime = Date.now() / 1000; // to get in milliseconds
    if (decoded.exp < currentTime) {
      // Logout user
      store.dispatch(logoutUser());
  
      // Redirect to login
      window.location.href = "./login";
    }
}

class App extends Component {
    render() {
        const { isAuthenticated } = this.props.auth;
        return isAuthenticated ? <AuthenticatedApp /> : <Login />
    }
}

App.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(App);
