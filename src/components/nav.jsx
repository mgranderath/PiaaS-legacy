import React from 'react';
import '../styles/nav.scss';

export default class Nav extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <nav id="navbar" className="level">
        <p className="level-item has-text-centered">
          <a className="link is-info">Home</a>
        </p>
        <p className="level-item big-text has-text-centered">
          PiaaS
        </p>
        <p className="level-item has-text-centered">
          <a className="link is-info">Github</a>
        </p>
      </nav>
    )
  }
  }