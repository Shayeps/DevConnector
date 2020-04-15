import axios from 'axios';
import { setAlert } from './alert';
import { GET_PROFILE, PROFILE_ERROR } from './types';

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
      }
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
