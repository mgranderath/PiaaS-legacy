import React from 'react';
import axios from 'axios';
import {Button} from 'react-toolbox/lib/button';
import '../styles/AppTable.css';
import {Dialog} from 'react-toolbox/lib/dialog';
import {Input} from 'react-toolbox/lib/input';
import {PulseLoader} from 'halogen';
import TextBlock from './textBlock';


export default class AppTable extends React.Component {
    constructor(props){
        super(props);
        this.api = '/api';
        this.state = {
            data: [],
            addActive: false,
            name: '',
            loading: false,
            response: ''
        };
        this.actions = [
            { label: 'Close', onClick: () => this.openApp()},
            { label: 'Add', onClick: () => this.saveApp()},
        ];
    }

    openApp(){
        this.setState({addActive: !this.state.addActive, name: ''});
    };

    handleApp(target){
        this.setState({name: target});
    }

    saveApp(){
        this.setState({loading: true});
        axios.put(this.api + '/add?name=' + this.state.name)
            .then((response) => {
                this.setState({response: response.data.repo});
                this.setState({loading: false});
            })
            .catch((err) => {
                console.log(err);
            });
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
            <div>
                <Button icon='add' label='Add' onClick={() => this.openApp()} flat primary/>
                <Dialog
                    actions={this.actions}
                    active={this.state.addActive}
                    onEscKeyDown={() => this.openApp()}
                    onOverlayClick={() => this.openApp()}
                    title='Add App'
                    >
                    <Input type="text" label="App Name" name="appname" value={this.state.name} onChange={(evt) => this.handleApp(evt) }/>
                    <TextBlock display={false} content={this.state.response} />
                    <PulseLoader color="#303f9f" loading={this.state.loading} size="16px"/>
                </Dialog>
            <table>
                <thead>
                    <tr><th>Name</th><th>State</th></tr>
                </thead>
                <tbody>
                {Object.keys(this.state.data).map((x, i) =>
                    <tr key={i}><td>{ this.state.data[x].instance.name }</td><td>{ this.state.data[x].running ? <Button onClick={() => {this.stopapp(this.state.data[x].instance.name, x)}} icon='stop' label='Stop' flat primary /> : <Button onClick={() => {this.startapp(this.state.data[x].instance.name, x)}} icon='directions_run' label='Start' flat primary /> }</td></tr>
                )}
                </tbody>
            </table>
            </div>
        )
    }
}