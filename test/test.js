import React from 'react';
import { shallow } from 'enzyme';
import assert from 'assert';
import Blobber from '../src/Blobber';

describe('Blobber', () => {

  it('renders the <Blobber /> component', () => {
    const wrapper = shallow(<Blobber />);
    assert(wrapper.find('svg'));
  });

});
