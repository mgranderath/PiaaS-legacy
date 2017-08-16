import * as React from 'react';
import { connect } from 'react-redux';
import '../styles/dashboard.scss';

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

  displayState(state: boolean) {
    if (state) {
      return <i className="fa fa-play"></i>;
    } else {
      return <i className="fa fa-stop"></i>;
    }
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
              <p className="heading">Running</p>
              <h2>
                { this.props.apps[this.state.name] && this.displayState(this.props.apps[this.state.name].running) }
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
