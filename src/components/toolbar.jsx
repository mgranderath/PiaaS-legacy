import React from 'react';
import '../styles/toolbar.scss';

export default class Toolbar extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <section className="container">
      <nav className="level">
        <div className="level-left">
          <button type="submit" className="level-item has-text-centered button is-primary">
            <span className="icon">
              <i className="fa fa-plus" aria-hidden="true"></i>
            </span>
            <span>Add</span>
          </button>
        </div>
      </nav>
      </section>
    )
  }
}