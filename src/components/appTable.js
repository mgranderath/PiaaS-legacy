import React from 'react';
import axios from 'axios';
import {Button} from 'react-toolbox/lib/button';
import '../styles/AppTable.css';

const App_Model = {
    name: {type: String},
    running: {type: Boolean}
};

export default class AppTable extends React.Component {
    constructor(props){
        super(props);
        this.api = '/api';
        this.state = {
            data: []
        };
    }

    startapp(name, x){
        axios.put(this.api + '/start?name=' + name)
            .then((response) => {
                let newdata = this.state.data;
                newdata[x].running = true;
                this.setState({data: newdata});
            })
            .catch((err) => {
                console.log(err);
            })
    };

    stopapp(name, x){
        axios.put(this.api + '/stop?name=' + name)
            .then((response) => {
                let newdata = this.state.data;
                newdata[x].running = false;
                this.setState({data: newdata});
            })
            .catch((err) => {
                console.log(err);
            });
    }

    getapps(){
        axios.get(this.api)
            .then((res) => {
                // Set state with result
                this.setState({data: res.data});
            })
            .catch((err) => {
                alert(err);
            })
    }

    componentDidMount(){
        // Make HTTP reques with Axios
        this.getapps();
    }

    render(){
        return (
            <table>
                <thead>
                    <tr><th>Name</th><th>State</th></tr>
                </thead>
                <tbody>
                {Object.keys(this.state.data).map((x, i) =>
                    <tr key={i}><td>{ this.state.data[x].name }</td><td>{ this.state.data[x].running ? <Button onClick={() => {this.stopapp(this.state.data[x].name, x)}} icon='stop' label='Stop' flat primary /> : <Button onClick={() => {this.startapp(this.state.data[x].name, x)}} icon='directions_run' label='Start' flat primary /> }</td></tr>
                )}
                </tbody>
            </table>
        )
    }
}