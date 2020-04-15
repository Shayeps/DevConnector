import React, { Fragment } from 'react';
import spinner from '../../img/Rolling-1s-200px.gif';

export default () => {
  return (
    <Fragment>
      <img
        src={spinner}
        style={{ width: '50px', margin: 'auto', display: 'block' }}
        alt='Loading...'
      />
    </Fragment>
  );
};
