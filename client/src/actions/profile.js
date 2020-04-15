import axios from 'axios';
import { setAlert } from './alert';
import { GET_PROFILE, PROFILE_ERROR, UPDATE_PROFILE } from './types';

// Get current user profile
export const getCurrentProfile = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/profile/me');

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: PROFILE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

// Create or update a profile
export const createProfile = (formData, history, edit = false) => async (
  dispatch
) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = await axios.post('/api/profile', formData, config);

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));

    // Because we are in actions file we can't use <Redirect> we need
    // to use this history.push method
    if (!edit) {
      history.push('/dashboard');
    }
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

    dispatch({
      type: PROFILE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

// Add Experience
export const addExperience = ({ formData, history }) => async (dispatch) => {
  console.log('addExperience: ', formData);
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = await axios.put('/api/profile/experience', formData, config);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert('Experience Added', 'success'));

    // Because we are in actions file we can't use <Redirect> we need
    // to use this history.push method
    history.push('/dashboard');
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

    dispatch({
      type: PROFILE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

// Add Education
export const AddEducation = ({ formData, history }) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = await axios.put('/api/profile/education', formData, config);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert('Education Added', 'success'));

    // Because we are in actions file we can't use <Redirect> we need
    // to use this history.push method
    history.push('/dashboard');
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

    dispatch({
      type: PROFILE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};
