import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import axios from 'axios';
import thunk from 'redux-thunk';

// action.js

export const fetchApps = () => {
  return function(dispatch) {
    axios.get('/api')
      .then((result) => {
        console.log(result.data);
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

export const reducers = combineReducers({
  apps,
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