import React from 'react';
import ReactDOM from 'react-dom';
import Blobber from './src/Blobber';

import './dev-styles.css';

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      algorithm: 'convex-hull',

      dragGroup: -1,
      dragging: -1,
      //rects: [{x1:30, y1:80, x2:180, y2:120},{x1:60, y1:60, x2:155, y2:100}, {x1:115, y1:15, x2:275, y2:50}]
      rectGroups: [
        [{x:30, y:250, width:150, height: 24},
        {x:100, y:285, width:150, height: 24},
        {x:200, y:310, width:150, height: 24}],

        [{x:180, y:270, width:150, height: 24},
        {x:250, y:260, width:150, height: 24},
        {x:160, y:240, width:150, height: 24}],

        [{x:50, y:220, width:150, height: 24},
        {x:200, y:190, width:150, height: 24},
        {x:250, y:170, width:150, height: 24}]
      ]
    };
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    //document.addEventListener('onmouseup', this.dragEnd.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    //document.removeEventListener('onmouseup', this.dragEnd.bind(this));
  }

  dragStart(group, i, event) {
    //console.log('mousedown', i, event);
    this.setState({dragGroup: group, dragging: i});
  }

  dragEnd(event) {
    //console.log('dragEnd');
    this.setState({dragging: -1});
  }

  handleMouseMove(e) {
    //console.log('drag: ', this.state.dragging);
    if (this.state.dragGroup == -1 || this.state.dragging == -1) return;
    var newRects = this.state.rectGroups.slice();
    newRects[this.state.dragGroup][this.state.dragging].x = e.pageX-30;
    newRects[this.state.dragGroup][this.state.dragging].y = e.pageY-10;
    //console.log('x ', e.pageX);
     this.setState({
       rectGroups: newRects
     });
     e.stopPropagation();
     e.preventDefault();
  }

  render() {

    const labels = [
      ['Mercury', 'Venus', 'Mars'],
      ['quarks', 'leptons', 'bosons'],
      ['heart', 'lungs', 'brain'],
    ];

    const rectDivs = this.state.rectGroups.map((rectGroup, i) => {
      const cells = rectGroup.map((rect, j) => {
        //console.log('rect ', rect);
        const width = rect.width;
        const height = rect.height;
        const top = rect.y;
        const left = rect.x;
        //console.log('rect loc ', width, height, top, left);
        const divStyle = {top:top, left:left, width:width, height:height, zIndex:100};
        return(
          <div className={'cell group_' + i} key={'group_' + i + '_' + j} style={divStyle}  onMouseDown={this.dragStart.bind(this, i, j)} onMouseUp={this.dragEnd.bind(this)}>
            <div className='label'>{labels[i][j]}</div>
          </div>
        );
      });
      return cells;
    });

    const blobColors = ['#D24D57', '#F5D76E', '#C5EFF7'];
    const blobbers = this.state.rectGroups.map((rectGroup, i)=> {
      return(
        <Blobber
          key={'blobber_' + i}
          rects={rectGroup}
          cornerRadius={16}
          pathOffset={8}
          svgStyle={{ fill: blobColors[i], stroke: blobColors[i] }}
          algorithm={this.state.algorithm} />
      );
    });

    return(
      <div>
        <div className='blobberDemo' style={{width:'1000px', height:'1000px', position:'relative'}}>

          {blobbers}
          {rectDivs}

        </div>
        <select name='algorithm' onChange={(e) => this.setState({ algorithm: e.target.value })} defaultValue='convex-hull'>
          <option value='convex-hull'>algorithm: convex hull</option>
          <option value='polygon-union'>algorithm: polygon union</option>
        </select>
      </div>
    );
  }

}


ReactDOM.render(<Main />, document.getElementById('root'));
