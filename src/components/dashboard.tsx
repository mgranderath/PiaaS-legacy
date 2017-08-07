import * as React from 'react';
import { connect } from 'react-redux';

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

  render() {
    return (
      <div>
        <section className="hero is-primary">
          <div className="hero-body">
            <div className="container">
              <nav className="level">
                <div className="level-left">
                  <div className="level-item">
                    <h1 className="title">
                      { this.props.apps[this.state.name] && this.props.apps[this.state.name].name }
                    </h1>
                  </div>
                  <div className="level-item">
                    <h2 className="subtitle">
                      { this.props.apps[this.state.name] && this.props.apps[this.state.name].type.type }
                    </h2>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                      { this.props.apps[this.state.name] && this.props.apps[this.state.name].running ?
                        <i className="fa fa-circle circle-active" title="Running" aria-hidden="true"></i> :
                        <i className="fa fa-circle circle-stopped" title="Stopped" aria-hidden="true"></i> } }
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </section>
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
