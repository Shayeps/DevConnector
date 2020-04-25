import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

// Here we are checking if a user is authenticated. if he is he will move on to the component he asked
// if not he will be redirected to login page. We need to get some props for it to work.
// component prop to know to which component the user trying to get. ...rest is all other props that
// were passed with the try to redirect, and auth props to check if he is authenticated.
// We call this component from the App component with the right props and this component
// will redirect the user to the login page or the right component
const PrivateRoute = ({
  component: Component,
  auth: { isAuthenticated, loading },
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        !isAuthenticated && !loading ? (
          <Redirect to='/' />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoute);
