import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import axios from 'axios';
import thunk from 'redux-thunk';

// action.js

export const fetchApps = () => {
  return function(dispatch) {
    axios.get('/api')
      .then((result) => {
        dispatch({
          type: 'GET_APPS_DATA',
          payload: result.data
        });
      })
      .catch((err) => {
        throw(err);
      })
  };
};

export const startApp = (name) => {
  return function(dispatch) {
    dispatch({type: 'APP_LOADING', name: name});
    axios.put('/api/start?name=' + name)
      .then((result) => {
        dispatch({type: 'APP_DONE',name: name});
        dispatch(fetchApps());
      })
      .catch((err) => {
        throw(err);
      })
  };
};

export const stopApp = (name) => {
  return function(dispatch) {
    dispatch({type: 'APP_LOADING', name: name});
    axios.put('/api/stop?name=' + name)
      .then((result) => {
        dispatch({type: 'APP_DONE', name: name});
        dispatch(fetchApps());
      })
      .catch((err) => {
        throw(err);
      })
  };
};

export const deleteApp = (name) => {
  return function(dispatch) {
    axios.put('/api/remove?name=' + name)
      .then((result) => {
        dispatch(fetchApps());
      })
      .catch((err) => {
        throw(err);
      })
  };
};

// reducers.js

export const apps = (state = {}, action) => {
  switch (action.type) {
    case 'GET_APPS_DATA':
      return action.payload;
    default:
      return state;
      break;
  }
};

export const loading = (state = {}, action) => {
  switch (action.type) {
    case 'APP_LOADING':
      let newState = {
        ...state,
      };
      newState[action.name] = true;
      return newState;
    case 'APP_DONE':
      newState = {
        ...state,
      };
      newState[action.name] = false;
      return newState;
    default:
      return {};
      break;
  }
};

export const reducers = combineReducers({
  apps,
  loading
});

// store.js

export function configureStore() {
  const store = createStore(
    reducers,
    compose(
      applyMiddleware(thunk),
      window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
  );
  return store;
};

export const store = configureStore();

store.dispatch(fetchApps());