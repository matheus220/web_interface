import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import cronstrue from 'cronstrue';
import DropdownList from 'react-widgets/lib/DropdownList'
import axios from 'axios';
import Cron from "./cron-generator.component";
import 'react-widgets/dist/css/react-widgets.css';

function formatDate(date) {
    var newDate = new Date(Date.parse(date));
    return newDate.toLocaleString();
}

class Task extends Component {

    constructor(props) {
        super(props);
        this._onClick = this._onClick.bind(this);
        this._handleChangeChk = this._handleChangeChk.bind(this);
    }

    _onClick() {
        if(typeof this.props.delete === "function") {
            this.props.delete(this.props.task._id);
        }
    }

    _handleChangeChk() {
        if(typeof this.props.onChangeChk === "function") {
            this.props.onChangeChk(this.props.task._id, !this.props.task.active);
        }
    }
    render() {
        return (
            <tr>
                <td>{formatDate(this.props.task.date)}</td>
                <td>{this.props.task.mission_name}</td>
                <td style={{textAlign: "justify", maxWidth: "400px"}}>{cronstrue.toString(this.props.task.cron_expression, { use24HourTimeFormat: true })}</td>
                <td>{formatDate(this.props.task.last)}</td>
                <td>{formatDate(this.props.task.next)}</td>
                <td style={{textAlign: "center"}}><input type="checkbox" defaultChecked={this.props.task.active} onChange={this._handleChangeChk}/></td>
                <td style={{textAlign: "center"}}>
                    <button type="button" id={this.props.task._id} onClick={this._onClick} className="btn btn-danger button-style" style={{width: "40px", verticalAlign: "middle", margin: "0px 0px 0px 0px", fontSize: "1.1em"}}>-</button>
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
            cron_expression: "0 0 * * *",
            selectedMission: null,
            missions: []
        };
        this.toggleModal = this.toggleModal.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onChangeCronExpression = this.onChangeCronExpression.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.taskList = this.taskList.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateActiveState = this.updateActiveState.bind(this);
    }

    toggleModal() {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    updateData() {
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

    componentDidMount() {
        this.updateData();
    }

    onChangeCronExpression(cron) {
        this.setState({
            cron_expression: cron
        });
    }

    onSubmit(e) {
        e.preventDefault();

        if(this.state.cron_expression && this.state.selectedMission) {
            const newTask = {
                mission_id: this.state.selectedMission._id,
                mission_name: this.state.selectedMission.name,
                cron_expression: this.state.cron_expression,
                active: true,
                date: Date()
            };
    
            axios.post('http://localhost:4000/task/add', newTask)
                .then(res => {
                    this.setState(prevState => ({
                        modal: !prevState.modal,
                        cron_expression: "0 0 * * *",
                        selectedMission: null
                    }));
                    this.updateData();
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

    updateActiveState(id, newActiveState) {
        var task = this.state.tasks.filter(task => task._id === id);
        if(task) {
            task[0].active = newActiveState;
            axios.post('http://localhost:4000/task/update/'+id, task[0])
                .then(res => console.log(res.data));
        }
    }

    taskList() {
        return this.state.tasks.map(currentTask => {
            return <Task task={currentTask} key={currentTask._id} delete={this.deleteItem} onChangeChk={this.updateActiveState} />;
        })
    }

    render() {
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
                            <table className="table table-striped table-bordered table-tasks" style={{width: "100%"}} >
                                <thead>
                                    <tr>
                                        <th style={{textAlign: "center"}}>Creation date</th>
                                        <th style={{textAlign: "center"}}>Mission</th>
                                        <th style={{textAlign: "center"}}>Schedule</th>
                                        <th style={{textAlign: "center"}}>Previous</th>
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
                            <DropdownList
                                filter={(item, searchTerm) => item.name.indexOf(searchTerm) > -1}
                                data={this.state.missions}
                                textField='name'
                                valueField='_id'
                                onChange={selectedMission => this.setState({selectedMission})}
                                placeholder="Choose a mission"
                            />
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