// app.js
//(function() {
var App = React.createClass({

  //this._boundDragHandler = this.dragHandler.bind(this);

  getInitialState: function(){
    return {
      dragging: -1,
      //rects: [{x1:30, y1:80, x2:180, y2:120},{x1:60, y1:60, x2:155, y2:100}, {x1:115, y1:15, x2:275, y2:50}]
      rects: [{x:30, y:250, width:100, height: 24},
              {x:150, y:200, width:150, height: 24},
              {x:200, y:100, width:200, height: 24}],
      rects2: [{x:50, y:150, width:100, height: 24},
              {x:150, y:220, width:150, height: 24},
              {x:200, y:150, width:100, height: 24}],
      rectPoints: [ {x1:47, y1:137, x2:237, y2:252},
                    {x1:277, y1:115, x2:417, y2: 205},
                    {x1:332, y1:14, x2:472, y2:104}]
    }
  },

  componentDidUpdate: function(state){
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.mouseMove)
      //document.addEventListener('mouseup', this.onMouseUp)
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.mouseMove)
      //document.removeEventListener('mouseup', this.onMouseUp)
    }
  },

  dragStart: function(i, event){
    //console.log('mousedown', i, event);
    this.setState({dragging: i});
  },

  dragEnd: function(event){
    //console.log('mouseup', this, event);
    this.setState({dragging: -1});
  },
  mouseMove: function(e){
    //console.log('drag: ', this.state.dragging);
    if (this.state.dragging == -1) return
    var newRects = this.state.rects.slice();
    newRects[this.state.dragging].x = e.pageX-30;
    newRects[this.state.dragging].y = e.pageY-30;
    //console.log('x ', e.pageX);
     this.setState({
       rects: newRects
     });
     e.stopPropagation();
     e.preventDefault();
  },

  render:function(){
      rectDivs = this.state.rects.map(function(rect, i){
      //console.log('rect ', rect);
      var width = rect.width;
      var height = rect.height;
      var top = rect.y;
      var left = rect.x;
      //console.log('rect loc ', width, height, top, left);
      var divStyle = {backgroundColor: 'none', opacity:'.5', borderRadius:'12px', opacity:'1', position:'absolute', top:top, left:left, width:width, height:height, zIndex:100};
      return(<div key={i} style={divStyle}  onMouseMove={this.mouseMove} onMouseDown={this.dragStart.bind(this, i)} onMouseUp={this.dragEnd}>
        label
        </div>
      );
    }, this);

    rectDivs2 = this.state.rects2.map(function(rect, i){
    //console.log('rect ', rect);
    var width = rect.width;
    var height = rect.height;
    var top = rect.y;
    var left = rect.x;
    //console.log('rect loc ', width, height, top, left);
    var divStyle = {backgroundColor: 'none', opacity:'.5', borderRadius:'12px', opacity:'1', position:'absolute', top:top, left:left, width:width, height:height, zIndex:100};
    return(<div key={'divs2_' + i} style={divStyle}  onMouseMove={this.mouseMove} onMouseDown={this.dragStart.bind(this, i)} onMouseUp={this.dragEnd}>
      label
      </div>
    );
  }, this);
    return(
      <div className='blobberDemo' style={{width:'1000px', height:'1000px', position:'relative'}}>

        <Blobber rects={this.state.rects} cornerRadius={12} pathOffset={5}/>
        {rectDivs}
        <Blobber rects={this.state.rects2} cornerRadius={12} pathOffset={5}/>
        {rectDivs2}
      </div>
    );
  }
});
React.render(<App />, document.getElementById('app'));
