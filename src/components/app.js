import React from 'react';
import '../styles/app.css';
import axios from 'axios';
import {Button} from 'react-toolbox/lib/button';
import AppTable from './appTable';
import {AppBar} from 'react-toolbox/lib/app_bar';

export default class App extends React.Component {
    constructor(props){
        super(props);
        this.api = '/api';
        this.state = {
            data: []
        }
    }

    render(){
        return (
            <div>
                <AppBar title='PiaaS' leftIcon='menu'></AppBar>
                <AppTable/>
            </div>
        )
    }
}
