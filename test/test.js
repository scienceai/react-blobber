import React from 'react';
import { shallow } from 'enzyme';
import assert from 'assert';
import Blobber from '../src/Blobber';

const rects = [
  { x: 30, y: 250, width: 150, height: 24 },
  { x: 100, y: 285, width: 150, height: 24 },
  { x: 200, y: 310, width: 150, height: 24 },
];

describe('Blobber', () => {

  it('renders the <Blobber /> component', () => {
    const wrapper = shallow(<Blobber rects={rects}/>);
    assert(wrapper.find('svg'));
  });

});
