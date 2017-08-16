import * as React from 'react';
import '../styles/toolbar.scss';
import { store, fetchApps } from '../redux';
import { connect } from 'react-redux';
import axios from 'axios';

class Toolbar extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      addActive: false,
      name: '',
      dir: '',
    };
  }

  toggleModal() {
    this.setState({ addActive: !this.state.addActive, name: '', dir: '' });
  }

  addApp() {
    axios.put('api/add?name=' + this.state.name)
      .then((response) => {
        this.setState({dir: response.data.repo});
        store.dispatch(fetchApps());
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleApp(target: any) {
    this.setState({ name: target.target.value });
  }

  render(){
    return (
      <section className="container">
      <nav className="level">
        <div className="level-left">
          <button type="submit" className="level-item has-text-centered button is-primary" onClick={() => { this.toggleModal(); }} >
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
                <input className="input" type="text" placeholder="App name" value={this.state.name} onChange={(evt) => this.handleApp(evt) }/>
                { this.state.dir !== '' ? <div className="box">{ this.state.dir }</div> : '' }
              </section>
              <footer className="modal-card-foot">
                {this.state.dir !== '' ? (
                    <a className="button" onClick={() => {this.toggleModal()}}>OK</a>
                  ) : (
                    <div>
                    <a className="button is-success" onClick={() => { this.addApp() }}>Save changes</a><a className="button" onClick={() => { this.toggleModal(); }}>Cancel</a>
                    </div>
                  )
                }
              </footer>
            </div>
          </div>
        </div>
      </nav>
      </section>
    )
  }
}

const mapStateToProps = (state: any, ownProps: any) => ({
  apps: state.apps,
});

const ToolbarContainer = connect(
  mapStateToProps,
)(Toolbar);
export default ToolbarContainer;
