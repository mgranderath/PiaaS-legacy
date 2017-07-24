import React from 'react';
import ReactDOM from 'react-dom';
import {Apps, App} from './components/app.jsx';
import './styles/index.css';
import { Provider } from 'react-redux';
import { store } from './redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

const container = document.getElementById('app');
ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter history={history}>
      <Switch>
      <Route exact path="/" component={Apps}/>
      <Route exact path="/app/:name" component={App}/>
      </Switch>
    </BrowserRouter>
  </Provider>,
  container
);