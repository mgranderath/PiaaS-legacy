import React from 'react';
import axios from 'axios';
import '../styles/AppTable.css';



export default class AppTable extends React.Component {

    constructor(props){
        super(props);
        this.api = '/api';
        this.state = {
          apps: {}
        }
        this.updateApps();
    }

    updateApps(){
      axios.get(this.api)
        .then((result) => {
          console.log(result.data);
          this.setState({apps: result.data});
        })
        .catch((err) => {
          console.log(err);
        })
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
                  Object.keys(this.state.apps).map((x, i) =>
                    <tr key={i}>
                      <td>{ this.state.apps[x].name }</td>
                      <td>{ this.state.apps[x].running ? <i className='fa fa-circle circle-active' title="Running" aria-hidden='true'></i> : <i className='fa fa-circle circle-stopped' title="Stopped" aria-hidden='true'></i> }</td>
                      <td>{ this.state.apps[x].type.type === 'node' ? <img src="https://png.icons8.com/nodejs/color/24" title="Nodejs" width="30" height="30" /> : "undefined" }</td>
                      <td>{ this.state.apps[x].running ? <button type="button" className="level-item has-text-centered button is-primary">Stop</button> : <button type="button" className="level-item has-text-centered button is-primary">Run</button> }</td>
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