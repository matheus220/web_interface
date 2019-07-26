import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Cron from 'react-cron-generator'
import Autosuggest from 'react-autosuggest';
import 'react-cron-generator/dist/cron-builder.css'
import axios from 'axios';

const Task = props => (
    <tr>
        <td>{props.task.date}</td>
        <td>{props.task.mission}</td>
        <td>{props.task.human_readable}</td>
        <td>
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
            cron: ""
        };
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
          modal: !prevState.modal
        }));
    }

    componentDidMount() {
        axios.get('http://localhost:4000/task/')
            .then(response => {
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

    taskList() {
        return this.state.tasks.map(function(currentTask, i){
            return <Task task={currentTask} key={i} />;
        })
    }

    render() {
        return (
            <div class="row">
                <div  class="col-md-12 col-xl-12">
                    <div className="card">
                        <div className="card-header">
                            <h5>Task List</h5>
                            <div className="card-header-right">
                                <Button color="success" onClick={this.toggle}>+</Button>
                            </div>
                        </div>
                        <div className="card-block" style={{minHeight: "550px"}}>
                            <table className="table table-striped" >
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Mission</th>
                                        <th>Schedule</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { this.taskList() }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className='matheus'>
                    <ModalHeader toggle={this.toggle}>Schedule new task</ModalHeader>
                    <ModalBody>
                        <div>
                            <Cron
                                onChange={(e)=> {this.setState({cron: e}); console.log(e)}}
                                value={this.state.value}
                                showResultText={true}
                                showResultCron={true}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggle}>Save</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}