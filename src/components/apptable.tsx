import axios from 'axios';
import * as React from 'react';
import '../styles/AppTable.css';
import { connect } from 'react-redux';
import { store, startApp, stopApp, deleteApp } from '../redux';
import { withRouter } from 'react-router-dom';


class AppTab extends React.Component<any, any> {
  api: string;
  state: any;

  constructor(props: any) {
    super(props);
    this.api = '/api';
    this.state = {
      apps: {},
    };
  }

  start(name: string) {
    this.props.dispatch(startApp(name));
  }

  stopApp(name: string) {
    this.props.dispatch(stopApp(name));
  }

  deleteapp(name: string) {
    if (!confirm('Are you sure?')) {
      return;
    }
    this.props.dispatch(deleteApp(name));
  }

  displayState(state: boolean) {
    if (state) {
      return <i className="fa fa-play"></i>;
    } else {
      return <i className="fa fa-stop"></i>;
    }
  }

  displayType(type: string) {
    switch (type){
      case 'node':
        return <i className="devicon-nodejs-plain"></i>;
      case 'python':
        return <i className="devicon-python-plain"></i>;
      default:
        return <p>Undefined</p>;
    }
  }

  render() {
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
                      <td onClick={() => {this.props.history.push('/app/' + this.props.apps[x].name);}}>{ this.props.apps[x].name }</td>
                      <td onClick={() => {this.props.history.push('/app/' + this.props.apps[x].name);}}><div className="icon">
                        { this.props.loading[this.props.apps[x].name] ? <img src="loading.gif" height="30px" width="30px" /> :
                          this.displayState(this.props.apps[x].running) }</div></td>
                      <td onClick={() => {this.props.history.push('/app/' + this.props.apps[x].name);}}>{ this.displayType(this.props.apps[x].type.type) }</td>
                      <td>
                        <nav className="level">
                        { this.props.apps[x].running ?
                        <button type="button" className="level-item has-text-centered button is-primary" onClick={() => {this.stopApp(this.props.apps[x].name);}}>Stop</button> :
                        <button type="button" className="level-item has-text-centered button is-primary" onClick={() => {this.start(this.props.apps[x].name);}}>Run</button> }
                        <button type="button" className="level-item button has-text-centered is-danger" onClick={() => { this.deleteapp(this.props.apps[x].name); }}>Delete</button>
                        </nav>
                      </td>
                    </tr>,
                  )
                }
                </tbody>
              </table>
              </div>
            </section>
    );
  }
}

const mapStateToProps = (state: any, ownProps: any) => ({
  apps: state.apps,
  loading: state.loading,
});

const AppTable = connect(
  mapStateToProps,
)(AppTab);
export default withRouter(AppTable);
