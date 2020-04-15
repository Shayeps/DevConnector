import axios from 'axios';
import { setAlert } from './alert';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
  CLEAR_PROFILE,
} from './types';
import setAuthToken from '../utils/setAuthToken';

// Load user from DB
export const loadUser = () => async (dispatch) => {
  // First we check if we got a token. If so we setting
  // the header to the request with this util
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    // Trying to get user from server side
    const res = await axios.get('/api/auth');

    // If request succeeded we dispatch USER_LOADED
    // payload = res.data = the user we got back in the response
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

// Login user
export const login = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({ email, password });

  try {
    // Sending the request to the server to login user with the
    // needed config and body of the request
    const res = await axios.post('/api/auth', body, config);

    // If the request succeeded, we will dispatch LOGIN_SUCCESS
    // and the payload will be the token we got back from the server
    // res.data == token
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });

    // We dispatch loadUser() so we can get the user details
    // right after the auth proccess finish
    dispatch(loadUser());
  } catch (error) {
    // In order to access the errors array we got back from the server
    // in case of failure we need to get into the errors array inside
    // the rsponse data
    const errors = error.response.data.errors;

    // We check if there are any errors
    if (errors) {
      // If we found errors, we itirate through each one of them and dispatch
      // an alert for each msg
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }

    // After finished with the alerts we will dispatch LOGIN_FAIL
    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

// Register user
export const register = ({ name, email, password }) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({ name, email, password });

  try {
    // Sending the request to the server to register user with the
    // needed config and body of the request
    const res = await axios.post('/api/users', body, config);

    // If the request succeeded, we will dispatch REGISTER_SUCCESS
    // and the payload will be the token we got back from the server
    // res.data == token
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });

    // We dispatch loadUser() so we can get the user details
    // right after the auth proccess finish
    dispatch(loadUser());
  } catch (error) {
    // In order to access the errors array we got back from the server
    // in case of failure we need to get into the errors array inside
    // the rsponse data
    const errors = error.response.data.errors;

    // We check if there are any errors
    if (errors) {
      // If we found errors, we itirate through each one of them and dispatch
      // an alert for each msg
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }

    // After finished with the alerts we will dispatch REGISTER_FAIL
    dispatch({
      type: REGISTER_FAIL,
    });
  }
};

// Logout / clear profile
export const logout = () => (dispatch) => {
  dispatch({ type: CLEAR_PROFILE });
  dispatch({ type: LOGOUT });
};
