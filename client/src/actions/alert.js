// Alert action. From this page we will dispacth an action
// to the reducer
import { v4 as uuidv4 } from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

// We can do this function with adding the dispatch function
// because of the thunk middleware we added in the store file
export const setAlert = (msg, alertType, timeout = 5000) => (dispatch) => {
  // Generate random id
  const id = uuidv4();

  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });

  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
