import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Here we check if the alerts is not null +
// the length of the alert array is longer then 0
// If both of the condition are true, we itirate through the array
// with the map function and return each alert msg inside a div
// that the key is the id of the alert and the className is it's
// alert type.
const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map((alert) => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};

// If we need to read state we need to import in the connect function
// mapStateToProps. Then inside it we need to select the state we want
// from the combineReducer file. In this case it's "alert"
const mapStateToProps = (state) => ({
  alerts: state.alert,
});

export default connect(mapStateToProps)(Alert);
