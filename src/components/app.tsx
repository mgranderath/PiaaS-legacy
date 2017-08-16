import * as React from 'react';
import '../styles/app.css';
import AppTable from './apptable';
import Nav from './nav';
import ToolbarContainer from './toolbar';
import Dashboard from './dashboard';
import { connect } from 'react-redux';

export class Apps extends React.Component <any, any> {
  api: string;
  state: any;

  constructor(props: any) {
    super(props);
    this.api = '/api';
    this.state = {
      data: [],
    };
  }

  render() {
    return (
            <div>
                <Nav/>
                <ToolbarContainer/>
                <AppTable/>
            </div>
    );
  }
}

class Container extends React.Component <any, any> {
  api: string;
  state: any;

  constructor(props: any) {
    super(props);
    this.api = '/api';
    this.state = {
      name: this.props.match.params.name,
    };
  }

  render() {
    return (
      <div>
        <Nav/>
        <div className="container">
          <Dashboard name={ this.state.name }/>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any, ownProps: any) => ({
  apps: state.apps,
  loading: state.loading,
});

export const App = connect(
  mapStateToProps,
)(Container);


