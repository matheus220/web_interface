import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import cronstrue from 'cronstrue';
import 'react-cron-generator/dist/cron-builder.css'
import axios from 'axios';
import Cron from "./cron-generator.component";

function formatDate(date) {
    var newDate = new Date(Date.parse(date));
    return newDate.toLocaleString();
}

class Task extends Component {

    constructor(props) {
        super(props);
        this._onClick = this._onClick.bind(this);
    }

    _onClick() {
        if(typeof this.props.delete === "function") {
            this.props.delete(this.props.task._id);
        }
    }

    render() {
        return (
            <tr>
                <td>{formatDate(this.props.task.date)}</td>
                <td>{this.props.task.mission_name}</td>
                <td>{this.props.task.human_readable}</td>
                <td>{formatDate(this.props.task.next)}</td>
                <td style={{textAlign: "center"}}>{formatDate(this.props.task.active) ? "True" : "False"}</td>
                <td style={{textAlign: "center"}}>
                    <button type="button" id={this.props.task._id} onClick={this._onClick} className="btn btn-danger" style={{margin: "0px 1px 0px 0px", fontSize: "1.1em"}}>-</button>
                </td>
            </tr>
        );
    }
}

export default class Schedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            tasks: [],
            cron: "",
            cron_expression: "0 0 0 ? * * *",
            mission: '',
            mission_id: '',
            missions: []
        };
        this.toggleModal = this.toggleModal.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onChangeCronExpression = this.onChangeCronExpression.bind(this);
        this.onChangeMission = this.onChangeMission.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.taskList = this.taskList.bind(this);
    }
    
    toggleModal() {
        this.setState(prevState => ({
            modal: !prevState.modal,
            cron_expression: "0 0 0 ? * * *",
            mission: '',
            mission_id: ''
        }));
    }

    componentDidMount() {
        axios.get('http://localhost:4000/task/')
            .then(response => {
                console.log(response.data)
                this.setState({ tasks: response.data });
            })
            .catch(function (error){
                console.log(error);
            })

        axios.get('http://localhost:4000/mission/')
            .then(response => {
                this.setState({ missions: response.data });
            })
            .catch(function (error){
                console.log(error);
            })
    }

    onChangeCronExpression(e) {
        console.log(e);
        this.setState({
            cron_expression: e
        });
    }

    onChangeMission(e) {
        console.log(e.target);
        let mission = this.state.missions.filter(mission => {
            return mission.name === e.target.value;
        });
        if (mission) {
            this.setState({
                mission: e.target.value,
                mission_id: mission[0]._id
            });
        }
        
    }

    onSubmit(e) {
        e.preventDefault();

        if(this.state.cron_expression && this.state.mission_id) {
            const newTask = {
                mission_id: this.state.mission_id,
                mission_name: this.state.mission,
                cron_expression: this.state.cron_expression,
                active: true,
                date: Date()
            };
    
            axios.post('http://localhost:4000/task/add', newTask)
                .then(res => {
                    this.setState(prevState => ({
                        modal: !prevState.modal,
                        cron_expression: "0 0 0 ? * * *",
                        mission: '',
                        mission_id: ''
                    }));
                });
        }
    }

    deleteItem(id) {
        axios.post('http://localhost:4000/task/delete/' + id)
            .then(response => {
                this.setState({
                    tasks: this.state.tasks.filter(task => task._id !== id)
                });
            })
            .catch(function (error){
                console.log(error);
            })
    }

    taskList() {
        return this.state.tasks.map(currentTask => {
            return <Task task={currentTask} key={currentTask._id} delete={this.deleteItem} />;
        })
    }

    render() {
        let renderMissions = this.state.missions.map(mission => {
            return( <option>{mission.name}</option> )       
        })
        return (
            <div className="row">
                <div  className="col-md-12 col-xl-12">
                    <div className="card">
                        <div className="card-header">
                            <h5>Task List</h5>
                            <div className="card-header-right">
                                <Button color="success" onClick={this.toggleModal}>+</Button>
                            </div>
                        </div>
                        <div className="card-block" style={{minHeight: "550px"}}>
                            <table className="table table-striped" >
                                <thead>
                                    <tr>
                                        <th style={{textAlign: "center"}}>Creation date</th>
                                        <th style={{textAlign: "center"}}>Mission</th>
                                        <th style={{textAlign: "center"}}>Schedule</th>
                                        <th style={{textAlign: "center"}}>Next</th>
                                        <th style={{textAlign: "center"}}>Active</th>
                                        <th style={{textAlign: "center"}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { this.taskList() }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                    <ModalHeader toggle={this.toggle}>Schedule new task</ModalHeader>
                    <ModalBody>
                        <div>
                            <div>
                                <Cron onCronChange={this.onChangeCronExpression}/>
                            </div>
                            <hr/>
                            <label>Cron Expression : 
                            <p style={{textAlign: "justify", marginBottom: 0, padding: "0.3rem"}}><strong>{cronstrue.toString(this.state.cron_expression, { use24HourTimeFormat: true })}</strong></p></label>
                            <br/>
                            <label>Mission : </label>
                            <select className="form-control" value={this.state.mission} onChange={this.onChangeMission}>
                                <option></option>
                                {renderMissions}
                            </select>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.onSubmit}>Save</Button>{' '}
                        <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}