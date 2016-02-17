import React from 'react';
import ReactDOM from 'react-dom';
import Blobber from './src/Blobber';

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dragGroup: -1,
      dragging: -1,
      //rects: [{x1:30, y1:80, x2:180, y2:120},{x1:60, y1:60, x2:155, y2:100}, {x1:115, y1:15, x2:275, y2:50}]
      rectGroups: [
        [{x:30, y:250, width:100, height: 24},
        {x:100, y:285, width:100, height: 24},
        {x:200, y:355, width:100, height: 24}],

        [{x:50, y:320, width:100, height: 24},
        {x:250, y:320, width:100, height: 24},
        {x:250, y:250, width:100, height: 24}]
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

  dragStart(group, i, event){
    //console.log('mousedown', i, event);
    this.setState({dragGroup: group, dragging: i});
  }

  dragEnd(event){
    console.log('dragEnd');
    this.setState({dragging: -1});
  }

  handleMouseMove(e){
    console.log('drag: ', this.state.dragging);
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

  render(){
    let rectDivs = this.state.rectGroups.map((rectGroup, i) => {
      let cells = rectGroup.map((rect, j) => {
        //console.log('rect ', rect);
        let width = rect.width;
        let height = rect.height;
        let top = rect.y;
        let left = rect.x;
        //console.log('rect loc ', width, height, top, left);
        let divStyle = {top:top, left:left, width:width, height:height, zIndex:100};
        return(
          <div className={'cell group_' + i} key={'group_' + i + '_' + j} style={divStyle}  onMouseDown={this.dragStart.bind(this, i, j)} onMouseUp={this.dragEnd.bind(this)}>
            <div className='label'> label</div>
          </div>
        );
      });
      return cells;
    });

    let blobbers = this.state.rectGroups.map((rectGroup, i)=> {
      console.log(i)
      return(
        <Blobber key={'blobber_' + i} rects={rectGroup} cornerRadius={16} pathOffset={4}/>
      );
    });

    return(
      <div className='blobberDemo' style={{width:'1000px', height:'1000px', position:'relative'}}>

        {blobbers}
        {rectDivs}

      </div>
    );
  }

}


ReactDOM.render(<Main />, document.getElementById('root'));
