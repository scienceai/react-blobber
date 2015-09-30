import React from 'react';
import { Route } from 'react-router';
import Main from './components/Main';
import App from './App';

export default (
  <Route component={App}>
      <Route path='/' component={Main} />
  </Route>
);
