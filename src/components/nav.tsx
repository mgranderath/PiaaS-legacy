import * as React from 'react';
import { Link } from 'react-router-dom';
import '../styles/nav.scss';

export default class Nav extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <nav id="navbar" className="level">
        <p className="level-item has-text-centered">
          <Link to="/" className="link is-info">Home</Link>
        </p>
        <p className="level-item big-text has-text-centered">
          PiaaS
        </p>
        <p className="level-item has-text-centered">
          <a className="link is-info" href="https://github.com/magrandera/PiaaS">Github</a>
        </p>
      </nav>
    );
  }
}
