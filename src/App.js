import React, { PropTypes, Component } from 'react';
import Header from './components/Header';
import Main from './components/Main';

if (__CLIENT__) {
  require('./App.css');
}

export default class App extends Component {
  static propTypes = {
    children: PropTypes.element
  }

  render() {
    return (

        <div id='boilerplate'>
          <Header />
          <Main>
            {this.props.children}
          </Main>
        </div>

    );
  }
}
