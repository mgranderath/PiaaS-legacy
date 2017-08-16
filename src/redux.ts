import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import axios from 'axios';
import thunk from 'redux-thunk';

// action.js

export const fetchApps = () => {
  return function(dispatch: any) {
    axios.get('/api')
      .then((result) => {
        dispatch({
          type: 'GET_APPS_DATA',
          payload: result.data,
        });
      })
      .catch((err) => {
        throw(err);
      });
  };
};

export const deployApp = (name: string) => {
  return function (dispatch: any) {
    dispatch({ type: 'APP_LOADING', name: name });
    axios.put('/api/push?name=' + name)
      .then((result) => {
        dispatch({type: 'APP_DONE',name: name});
        dispatch(fetchApps());
      })
      .catch((err) => {
        throw(err);
      });
  };
};

export const startApp = (name: string) => {
  return function (dispatch: any) {
    dispatch({ type: 'APP_LOADING', name: name });
    axios.put('/api/start?name=' + name)
      .then((result) => {
        dispatch({type: 'APP_DONE',name: name});
        dispatch(fetchApps());
      })
      .catch((err) => {
        throw(err);
      });
  };
};

export const stopApp = (name: string) => {
  return function(dispatch: any) {
    dispatch({ type: 'APP_LOADING', name: name });
    axios.put('/api/stop?name=' + name)
      .then((result) => {
        dispatch({ type: 'APP_DONE', name: name });
        dispatch(fetchApps());
      })
      .catch((err) => {
        throw(err);
      });
  };
};

export const deleteApp = (name: string) => {
  return function(dispatch: any) {
    axios.put('/api/remove?name=' + name)
      .then((result) => {
        dispatch(fetchApps());
      })
      .catch((err) => {
        throw(err);
      });
  };
};

// reducers.js

export const apps = (state = {}, action: any) => {
  switch (action.type) {
    case 'GET_APPS_DATA':
      return action.payload;
    default:
      return state;
  }
};

export const loading = (state: any = {}, action: any) => {
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
  }
};

export const reducers = combineReducers({
  apps,
  loading,
});

// store.js

export function configureStore() {
  const store = createStore(
    reducers,
    compose(
      applyMiddleware(thunk),
      // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    ),
  );
  return store;
}

export const store = configureStore();

store.dispatch(fetchApps());
