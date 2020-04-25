import {
  GET_PROFILE,
  GET_PROFILES,
  PROFILE_ERROR,
  CLEAR_PROFILE,
  UPDATE_PROFILE,
  GET_REPOS,
  RESET_PROFILE_LOADING,
} from '../actions/types';

const initialState = {
  profile: null,
  profiles: [],
  repos: [],
  loading: true,
  errors: {},
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_PROFILE:
    case UPDATE_PROFILE:
      return {
        ...state,
        profile: payload,
        loading: false,
      };

    case GET_PROFILES:
      return {
        ...state,
        profiles: payload,
        loading: false,
      };

    case GET_REPOS:
      return {
        ...state,
        repos: payload,
        loading: false,
      };

    case PROFILE_ERROR:
      return {
        ...state,
        errors: payload,
        loading: false,
        profile: null,
      };
    case CLEAR_PROFILE:
      return {
        ...state,
        profile: null,
        repos: [],
        loading: false,
      };

    case RESET_PROFILE_LOADING:
      return {
        ...state,
        loading: true,
      };
    default:
      return state;
  }
}
