import React from 'react';
import axios from 'axios';
import '../styles/AppTable.css';
import { connect } from 'react-redux';
import { store, startApp, stopApp } from '../redux';

class AppTab extends React.Component {

    constructor(props){
        super(props);
        this.api = '/api';
        this.state = {
          apps: {}
        }
    }

    start(name){
      this.props.dispatch(startApp(name));
    }

    stopApp(name){
      this.props.dispatch(stopApp(name));
    }

    render(){
        return (
            <section className="section">
              <div className="container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                {
                  Object.keys(this.props.apps).map((x, i) =>
                    <tr key={i}>
                      <td>{ this.props.apps[x].name }</td>
                      <td>{ this.props.loading[this.props.apps[x].name] ? <img src='loading.gif' height='30px' width='30px' /> :
                        this.props.apps[x].running ?
                        <i className='fa fa-circle circle-active' title="Running" aria-hidden='true'></i> :
                        <i className='fa fa-circle circle-stopped' title="Stopped" aria-hidden='true'></i> }</td>
                      <td>{ this.props.apps[x].type.type === 'node' ? <img src="https://png.icons8.com/nodejs/color/24" title="Nodejs" width="30" height="30" /> : "undefined" }</td>
                      <td>{ this.props.apps[x].running ? <button type="button" className="level-item has-text-centered button is-primary" onClick={() => {this.stopApp(this.props.apps[x].name)}}>Stop</button> : <button type="button" className="level-item has-text-centered button is-primary" onClick={() => {this.start(this.props.apps[x].name)}}>Run</button> }</td>
                    </tr>
                  )
                }
                </tbody>
              </table>
              </div>
            </section>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
  apps: state.apps,
  loading: state.loading,
});

const AppTable = connect(
  mapStateToProps,
)(AppTab);
export default AppTable;
