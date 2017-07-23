import React from 'react';
import '../styles/toolbar.scss';
import { store, fetchApps } from '../redux';
import { connect } from 'react-redux';

class Toolbar extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      addActive: false,
    }
  }

  toggleModal(){
    this.setState({addActive: !this.state.addActive});
    fetchApps();
  }

  render(){
    return (
      <section className="container">
      <nav className="level">
        <div className="level-left">
          <button type="submit" className="level-item has-text-centered button is-primary" onClick={() => { this.toggleModal() }} >
            <span className="icon">
              <i className="fa fa-plus" aria-hidden="true"></i>
            </span>
            <span>Add</span>
          </button>
          <div className={"modal" + " " + (this.state.addActive ? 'is-active' : 'test')} >
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Add App</p>
                <button className="delete" onClick={() => {this.toggleModal()}}></button>
              </header>
              <section className="modal-card-body">
                <input className="input" type="text" placeholder="App name" />
              </section>
              <footer className="modal-card-foot">
                <a className="button is-success">Save changes</a>
                <a className="button">Cancel</a>
              </footer>
            </div>
          </div>
        </div>
      </nav>
      </section>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  apps: state.apps,
});

const ToolbarContainer = connect(
  mapStateToProps,
)(Toolbar);
export default ToolbarContainer;