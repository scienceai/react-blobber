require('es6-promise').polyfill();
require('isomorphic-fetch');
require('babel/polyfill');

import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import routes from './routes';

const history = createBrowserHistory();

ReactDOM.render((
  <Router history={history}>
    {routes}
  </Router>
), document.getElementById('root'));


if (process.env.NODE_ENV !== 'production') {
  window.React = React; // dev tools
  const reactRoot = window.document.getElementById('root');

  if (!reactRoot || !reactRoot.firstChild || !reactRoot.firstChild.attributes || !reactRoot.firstChild.attributes['data-react-checksum']) {
    console.log('Server-rendered React was discarded.');
  }
}
