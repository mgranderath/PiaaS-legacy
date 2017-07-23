import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app.jsx';
import './styles/index.css';
import { Provider } from 'react-redux';
import { store } from './redux';

const container = document.getElementById('app');
ReactDOM.render(
  <Provider store={store}>
  <App></App>
  </Provider>,
  app
);