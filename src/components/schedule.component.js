import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Cron from 'react-cron-generator'
import 'react-cron-generator/dist/cron-builder.css'
import axios from 'axios';

function formatDate(date) {
    var newDate = new Date(Date.parse(date));
    return newDate.toLocaleString();
}

const Task = props => (
    <tr>
        <td>{formatDate(props.task.date)}</td>
        <td>{props.task.mission_name}</td>
        <td>{props.task.human_readable}</td>
        <td>{formatDate(props.task.next)}</td>
        <td style={{textAlign: "center"}}>{formatDate(props.task.active) ? "True" : "False"}</td>
        <td style={{textAlign: "center"}}>
            <button type="button" className="btn btn-danger" style={{margin: "0px 1px 0px 0px", fontSize: "1.1em"}}>-</button>
        </td>
    </tr>
)

export default class Schedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            tasks: [],
            cron: "",
            cron_expression: "",
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
            cron_expression: "",
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
        console.log(e.target.value);
        this.setState({
            cron_expression: e.target.value
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
                        cron_expression: "",
                        mission: '',
                        mission_id: ''
                    }));
                });
        }
    }

    deleteItem(id) {
        console.log(id)
    }

    taskList() {
        return this.state.tasks.map((currentTask, i) => {
            return <Task task={currentTask} key={i} />;
        })
    }

    render() {
        let renderMissions = this.state.missions.map(mission => {
            return( <option>{mission.name}</option> )       
        })
        return (
            <div class="row">
                <div  class="col-md-12 col-xl-12">
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
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} className='matheus'>
                    <ModalHeader toggle={this.toggle}>Schedule new task</ModalHeader>
                    <ModalBody>
                        <div>
                            <label>Cron expression : </label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={this.state.cron_expression}
                                    onChange={this.onChangeCronExpression}
                                    required
                                    />
                            
                            <label>Mission : </label>
                            <select class="form-control" value={this.state.mission} onChange={this.onChangeMission}>
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