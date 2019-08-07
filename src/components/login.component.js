import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../actions/authActions";
import classnames from "classnames";

class Login extends Component {
    constructor() {
        super();
        this.state = {
            email: "",
            password: "",
            errors: {}
        };
    }

    componentDidMount() {
        // If logged in and user navigates to Login page, should redirect them to dashboard
        if (this.props.auth.isAuthenticated) {
            this.props.history.push("/");
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuthenticated) {
            this.props.history.push("/");
        }

        if (nextProps.errors) {
            this.setState({
                errors: nextProps.errors
            });
        }
    }

    onChange = e => {
        this.setState({ [e.target.id]: e.target.value });
    };

    onSubmit = e => {
        e.preventDefault();

        const userData = {
            email: this.state.email,
            password: this.state.password
        };

        this.props.loginUser(userData);
    };

    render() {
        const { errors } = this.state;

        return (
            <div class="container" style={{height: "100vh"}}>
                <div class="row justify-content-center align-items-center h-100">
                    <div class="col col-sm-10 col-md-8 col-lg-6 col-xl-5">
                        <div className="card" style={{padding: "40px"}}>
                            <div className="card-header">
                                <h4><b>Login</b></h4>
                            </div>
                            <div className="card-block">
                                <form noValidate onSubmit={this.onSubmit}>
                                    <div className="form-group">
                                        <input
                                            onChange={this.onChange}
                                            value={this.state.email}
                                            error={errors.email}
                                            id="email"
                                            type="email"
                                            placeholder="Username"
                                            className={classnames("form-control form-control", {
                                                invalid: errors.email || errors.emailnotfound
                                            })}
                                        />
                                        <span className="red-text">
                                            {errors.email}
                                            {errors.emailnotfound}
                                        </span>
                                    </div>
                                    <div className="form-group">
                                        <input
                                            onChange={this.onChange}
                                            value={this.state.password}
                                            error={errors.password}
                                            id="password"
                                            type="password"
                                            placeholder="Password"
                                            className={classnames("form-control form-control", {
                                                invalid: errors.password || errors.passwordincorrect
                                            })}
                                        />
                                        <span className="red-text">
                                            {errors.password}
                                            {errors.passwordincorrect}
                                        </span>
                                    </div>
                                    <div className="form-group" style={{marginTop: "30px"}}>
                                        <button type="submit" className="btn btn-info btn-lg btn-block">
                                            SIGN IN
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    loginUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { loginUser }
)(Login);
