import * as React from 'react';
import { connect } from 'react-redux';
import '../styles/dashboard.scss';
import { startApp, stopApp, deployApp } from '../redux';

class Dashbrd extends React.Component<any, any> {
  api: string;
  state: any;

  constructor(props: any) {
    super(props);
    this.api = '/api';
    this.state = {
      name: this.props.name,
    };
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

  displayState(app: any) {
    if (this.props.loading[app.name]) {
      return <img src="../loading.gif" height="30px" width="30px" />;
    }
    if (app.running) {
      return <i className="fa fa-play"></i>;
    } else {
      return <i className="fa fa-stop"></i>;
    }
  }

  start(name: string) {
    this.props.dispatch(startApp(name));
  }

  stop(name: string) {
    this.props.dispatch(stopApp(name));
  }

  deploy(name: string) {
    this.props.dispatch(deployApp(name));
  }

  displayActions(app: any) {
    let actions = null;
    if (!app) {
      return actions;
    }
    if (app.running) {
      actions = <button type="button" className="button is-primary" onClick={() => {this.stop(app.name);}}>Stop</button>;
    }else if (app.type.type) {
      actions = <button type="button" className="button is-primary" onClick={() => {this.start(app.name);}}>Start</button>;
    }
    return actions;
  }

  render() {
    return (
      <div className="container">
        <nav className="level appTitle">
          <h1 className="level-item has-text-centered">
            { this.props.apps[this.state.name] && this.props.apps[this.state.name].name }
          </h1>
        </nav>
        <nav className="level appInfo">
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Type</p>
              <h2>
                { this.props.apps[this.state.name] &&
                  this.displayType(this.props.apps[this.state.name].type.type) }
              </h2>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Actions</p>
              <div>
                { this.displayActions(this.props.apps[this.state.name]) }
                <button type="button" className="button is-primary" onClick={() => { this.deploy(this.state.name); }}>Deploy</button>
              </div>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Running</p>
              <h2>
                { this.props.apps[this.state.name] && this.displayState(this.props.apps[this.state.name]) }
              </h2>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

const mapStateToProps = (state: any, ownProps: any) => ({
  apps: state.apps,
  loading: state.loading,
});

const Dashboard = connect(
  mapStateToProps,
)(Dashbrd);

export default Dashboard;
