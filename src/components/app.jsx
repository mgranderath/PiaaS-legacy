import React from 'react';
import '../styles/app.css';
import AppTable from './apptable.jsx';
import Nav from './nav.jsx';
import ToolbarContainer from './toolbar.jsx';

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
                <Nav/>
                <ToolbarContainer/>
                <AppTable/>
            </div>
        )
    }
}
