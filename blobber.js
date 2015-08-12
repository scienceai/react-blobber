// import { Component, PropTypes } from 'react';
// import classnames from 'classnames';

//export default class Blobber extends Component {
class Blobber extends React.Component{

  constructor(props) {
        super(props);
        if(this.props.rects){
          // if x, y, width, height is provided, convert to pure points
          this.rectPoints = this.rect2rectPoints(this.props.rects);
        } else {
          this.rectPoints = this.props.rectPoints;
        }
  }
  rect2rectPoints(rects){
     var rectPoints = this.props.rects.map(function(rect){
      var x1 = rect.x;
      var y1 = rect.y
      var x2 = rect.x + rect.width;
      var y2 = rect.y + rect.height;
      return({x1: x1, y1: y1, x2:x2, y2: y2});
    });
    return(rectPoints);
  }
  componentWillReceiveProps(props){
    if(this.props.rects){
      // if x, y, width, height is provided, convert to pure points
      this.rectPoints = this.rect2rectPoints(this.props.rects);
    } else {
      this.rectPoints = this.props.rectPoints;
    }
  }
  orthoConvexHull(rects, offset){
    //Orthogonal/X-Y Convex Hull
    var points = [];

    // get all the points in the rect Array

    for(var i = 0; i < rects.length; i++){
      points.push({x: rects[i].x1 - offset, y: rects[i].y1 - offset});
      points.push({x: rects[i].x1 - offset, y: rects[i].y2 + offset});
      points.push({x: rects[i].x2 + offset, y: rects[i].y2 + offset});
      points.push({x: rects[i].x2 + offset, y: rects[i].y1 - offset});

    }

    console.log('points: ', JSON.stringify(points));

    // find min and max values of y
    var min_y = Number.POSITIVE_INFINITY;
    var min_yPoint;
    var max_y = Number.NEGATIVE_INFINITY;
    var max_yPoint;
    var min_x = Number.POSITIVE_INFINITY;
    var min_xPoint;
    var max_x = Number.NEGATIVE_INFINITY;
    var max_xPoint;
    var tmp;
    for(i = points.length-1; i>=0; i--){
      tmp = points[i].y;
      if(tmp < min_y){
        min_yPoint = points[i];
        min_y = points[i].y;
      } else if(tmp > max_y) {
        max_yPoint = points[i];
        max_y = points[i].y;
      }
      tmp = points[i].x;
      if(tmp < min_x){
        min_xPoint = points[i];
        min_x = points[i].x;
      } else if(tmp > max_x) {
        max_xPoint = points[i];
        max_x = points[i].x;
      }
    }
    //debugger;
    // sort points by x coordinate, then by y
    points.sort(function(a,b){
        // if(a.y == b.y) return a.x-b.x;
        // return a.y-b.y;
        if(a.x == b.x) return a.y-b.y;
        return a.x-b.x;

    });

    console.log('sorted points: ', JSON.stringify(points));

    console.log('minYPoint: ', min_yPoint);
    console.log('maxYPoint: ', max_yPoint);

    // duplicate array
    var reversedPoints = points.slice(0);
    // and reverse
    reversedPoints.reverse();

    // construct upper paths
    var upperLeft = this.orthoBuildUpperLeft(points, min_yPoint);
    console.log('upperLeft: ', upperLeft );
    var upperRight = this.orthoBuildUpperRight(reversedPoints, max_xPoint);
    console.log('upperRight: ', upperRight );

    // construct lower paths
    var lowerLeft = this.orthoBuildLowerLeft(points, max_yPoint);
    console.log('lowerLeft: ', lowerLeft);
    var lowerRight = this.orthoBuildLowerRight(reversedPoints, max_yPoint);
    console.log('lowerRight: ', lowerRight);

    upperRight.reverse();
    lowerRight.reverse();
    lowerLeft.reverse();


    var hull = upperLeft.concat(upperRight, lowerRight, lowerLeft);
    //var hull = lowerRight;
    //var hull = lowerLeft.concat(lowerRight, upperLeft, upperRight);
    console.log('hull', JSON.stringify(hull));

    // remove repeats
    // for(i = 1; i < hull.length; i++){
    //   if(hull[i].x == hull[i-1].x && hull[i].y == hull[i-1].y){
    //     // remove duplicate
    //     hull.splice(i, 1);
    //     i--;
    //   }
    // }
    //      console.log('cleaned hull', JSON.stringify(hull));

  //  remove all duplicate points
  hull = hull.reduce((prev, curr) => {
     if (!prev.some(point => point.x === curr.x && point.y === curr.y)) {
       prev.push(curr);
     }
      return prev;
   }, []);

  // remove redundant points on lines
//   var hullLength = 0;
//   while(hull.length != hullLength){
//     hullLength = hull.length;
//   for(i=2; i<hull.length; i++){
//     if(hull[i-2].x == hull[i-1].x && hull[i-1].x == hull[i].x){
//       console.log('remove: ', hull[i-2].x, hull[i-1].x, hull[i].x );
//       hull.splice(i-1, 1);
//     }
//   }
//   for(i=2; i<hull.length; i++){
//     if(hull[i-2].y == hull[i-1].y && hull[i-1].y == hull[i].y){
//       console.log('remove: ', hull[i-2].y, hull[i-1].y, hull[i].y );
//       hull.splice(i-1, 1);
//
//     }
//   }
// }

  var hullLength = 0;
  while(hull.length != hullLength){

    hullLength = hull.length;

    for(i=0; i<hull.length; i++){
      var x2i = i+1;
      if(x2i > hull.length-1) x2i = (x2i - hull.length);
      var x3i = i+2;
      if(x3i > hull.length-1) x3i = (x3i - hull.length);
      console.log('is ', hull.length, i, x2i, x3i );
      if(hull[i].x == hull[x2i].x && hull[i].x == hull[x3i].x){
        //console.log('remove: ', hull[i-2].x, hull[i-1].x, hull[i].x );
        hull.splice(x2i, 1);
      }
    }
    for(i=0; i<hull.length; i++){
      var y2i = i+1;
      if(y2i > hull.length-1) y2i = (y2i - hull.length);
      var y3i = i+2;
      if(y3i > hull.length-1) y3i = (y3i - hull.length);
      if(hull[i].y == hull[y2i].y && hull[i].y == hull[y3i].y){
        //console.log('remove: ', hull[i-2].x, hull[i-1].x, hull[i].x );
        hull.splice(y2i, 1);
      }
    }

    // for(i=2; i<=hull.length+2; i++){
    //   //if(i > hull.length-2) i = hull.length - (i - hull.length-1);
    //   if(hull[i-2].y == hull[i-1].y && hull[i-1].y == hull[i].y){
    //     console.log('remove: ', hull[i-2].y, hull[i-1].y, hull[i].y );
    //     hull.splice(i-1, 1);
    //
    //   }
    // }
 }
  var closeLine = [{x: hull[hull.length-1].x, y: hull[hull.length-1].y},
                   {x: hull[0].x, y: hull[0].y}];

     hull = hull.concat([{x: hull[0].x, y: hull[0].y}]);
     //console.log('closeLine: ', JSON.stringify(closeLine));

     console.log('cleaned hull', JSON.stringify(hull));

    //  hull = upperLeft;
    // hull = upperRight;
    //
    // hull = lowerRight;

    // hull = lowerLeft;


    return(hull);
  }


orthoBuildLowerLeft(points){
  var section = [points[0]];

  for(var i=0; i < points.length; i++){
    //console.log('x,y: ', points[i].x, points[i].y);
    if(section.length > 1){
      if(points[i].y == section[section.length-1].y){
        // horizontal line
        if(points[i].x >section[section.length-1].x){
          //right
          section.push(points[i]);
        }
      }
      if(points[i].x == section[section.length-1].x){
        // vertical line
        if(points[i].y > section[section.length-1].y){
          section.push(points[i]);
        }
      }
      if(points[i].y > section[section.length-1].y){
        if(points[i].x > section[section.length-1].x){
          // down right
          //section[section.length-1].y = points[i].y
          var y = section[section.length-1].y;
          var x = points[i].x
          section.push({x: x, y: y});
          section.push(points[i]);
        }
      }
    } else {
      // first point
      section.push(points[i]);
    }
  }
  return section;
}
orthoBuildLowerRight(points, max_yPoint){
  var section = [max_yPoint];

  for(var i=0; i < points.length; i++){
    //console.log('lr x,y: ', points[i].x, points[i].y);
    if(section.length >= 1){
      if(points[i].y == section[section.length-1].y){
        // horizontal line
        if(points[i].x > section[section.length-1].x){
          //right
          section.push(points[i]);
        }
      }
      if(points[i].x == section[section.length-1].x){
        // vertical line
        if(points[i].y < section[section.length-1].y){
          section.push(points[i]);
        }
      }
      if(points[i].y < section[section.length-1].y){
        if(points[i].x > section[section.length-1].x){
          // up right
          //section[section.length-1].x = points[i].x
          var x = section[section.length-1].x;
          var y = points[i].y
          section.push({x: x, y: y});
          section.push(points[i]);
        }
      }
    } else {
      // first point
      // if(points[i].y == max_yPoint){
      //   section.push(points[i]);
      // }
    }
  }
  return section;
}
orthoBuildUpperLeft(points, min_yPoint){
  var section = [points[0]];

  for(var i=0; i < points.length; i++){
    //console.log('x,y: ', points[i].x, points[i].y);
    if(section.length > 1){
      if(points[i].y == section[section.length-1].y){
        // horizontal line
        if(points[i].x > section[section.length-1].x){
          //right
          section.push(points[i]);
        }
      }
      if(points[i].x == section[section.length-1].x){
        // vertical line
        if(points[i].y < section[section.length-1].y){
          section.push(points[i]);
        }
      }
      if(points[i].y < section[section.length-1].y){
        if(points[i].x > section[section.length-1].x){
          // up right
          //section[section.length-1].x = points[i].x
          var y = section[section.length-1].y;
          var x = points[i].x
          section.push({x: x, y: y});
          section.push(points[i]);
        }
      }
    } else {
      // first point
      section.push(points[i]);
    }
  }
  return section;
}

orthoBuildUpperRight(points, max_xPoint){
  var section = [];
  //console.log('buildUpperRight');
  for(var i=0; i < points.length; i++){
    if(section.length > 1){
      if(points[i].y == section[section.length-1].y){
        // horizontal line
        if(points[i].x < section[section.length-1].x){
          section.push(points[i]);
        }
      }
      if(points[i].x == section[section.length-1].x){
        // vertical line
        if(points[i].y < section[section.length-1].y){
          section.push(points[i]);
        }
      }
      if(points[i].y < section[section.length-1].y){
        if(points[i].x < section[section.length-1].x){
          // up left
          //section[section.length-1].x = points[i].x
          var y = section[section.length-1].y;
          var x = points[i].x
          section.push({x: x, y: y});
          section.push(points[i]);
        }
      }
    } else {
      // first point
      if(points[i].x == max_xPoint.x){
        section.push(points[i]);
      }
    }
  }
  return section;
}

roundedSVGPath( points, r ){

  var svgPath;

  if (!points.length) return;

  //compute the middle of the first line as start-stop-point:
 var deltaX, deltaY, deltaX2, deltaY2, deltaX3, deltaY3, xPerY, startX, startY;
 var radius1, radius2, radius3;

  svgPath = 'M';
  var prevRadius, radius;
  prevRadius = radius = r;

  for (var i = 0; i < points.length; i++){

    // TODO - need to look 3 segments ahead to calc correct line distance
    // with radi

    // some logic to deel with closing the loop
    if(i == 0){
      deltaX = points[i].x - points[points.length-1].x;
      deltaY = points[i].y - points[points.length-1].y;
      deltaX2 = points[i+1].x - points[i].x;
      deltaY2 = points[i+1].y - points[i].y;
      deltaX3 = points[i+2].x - points[i+1].x;
      deltaY3 = points[i+2].y - points[i+1].y;
    } else if(i < points.length-2){
      deltaX = points[i].x - points[i-1].x;
      deltaY = points[i].y - points[i-1].y;
      deltaX2 = points[i+1].x - points[i].x;
      deltaY2 = points[i+1].y - points[i].y;
      deltaX3 = points[i+2].x - points[i+1].x;
      deltaY3 = points[i+2].y - points[i+1].y;
    } else if (i == points.length-2){
      deltaX = points[i].x - points[i-1].x;
      deltaY = points[i].y - points[i-1].y;
      deltaX2 = points[1].x - points[i].x;
      deltaY2 = points[1].y - points[i].y
      deltaX3 = points[2].x - points[1].x;
      deltaY3 = points[2].y - points[1].y
    }else if (i == points.length-1){
      deltaX = points[i].x - points[i-1].x;
      deltaY = points[i].y - points[i-1].y;
      deltaX2 = points[2].x - points[i].x;
      deltaY2 = points[2].y - points[i].y
      deltaX3 = points[3].x - points[3].x;
      deltaY3 = points[3].y - points[3].y
    }

    console.log('delta x y: ', i,  deltaX, deltaY);
    console.log('delta2 x y: ', i,  deltaX2, deltaY2);
    console.log('delta3 x y: ', i,  deltaX3, deltaY3);
    var rX = 100;
    var rY = 100;

    radius1 = radius2 = radius3 = r;

    if (deltaX != 0 && Math.abs(deltaX)/2 < radius1){
      radius1 = Math.abs(deltaX)/2;
    }
    if (deltaY != 0 && Math.abs(deltaY)/2 < radius1){
      radius1 = Math.abs(deltaY)/2;
    }
    if (deltaX2 != 0 && Math.abs(deltaX2)/2 < radius2){
      radius2 = Math.abs(deltaX2)/2;
    }
    if (deltaY2 != 0 && Math.abs(deltaY2)/2 < radius2){
      radius2 = Math.abs(deltaY2)/2;
    }
    if (deltaX3 != 0 && Math.abs(deltaX3)/2 < radius3){
      radius3 = Math.abs(deltaX3)/2;
    }
    if (deltaY3 != 0 && Math.abs(deltaY3)/2 < radius3){
      radius3 = Math.abs(deltaY3)/2;
    }
    prevRadius = radius;
    radius = Math.min(radius1, radius2, radius3 );
    var negRadius = -1 * radius;

    console.log('radius: ', radius, ' from ', radius1, radius2, radius3);
    //svgPath += ' L ' + (points[i].x ) + ' ' + (points[i].y );

    if(deltaY < 0){
      // up
      console.log('up ', deltaY);
      if (svgPath == 'M') svgPath += ' ' + points[0].x + ' ' + (points[0].y - radius);

      svgPath += ' l ' + (deltaX) + ' ' + (deltaY + prevRadius + radius);

      if(deltaX2 < 0){
        // up then left
        svgPath += ' s 0 ' + negRadius + ' ' + negRadius + ' ' + negRadius;
      } else if (deltaX2 > 0){
        // up then right
        console.log(' then curve right ', radius);
        svgPath += ' s 0 ' + negRadius + ' ' + radius + ' ' + negRadius;
      }
    } else if(deltaY > 0){
      //down
      console.log('down ', deltaY);
      if (svgPath == 'M') svgPath += ' ' + points[0].x + ' ' + (points[0].y + radius);

      svgPath += ' l ' + (deltaX) + ' ' + (deltaY - (prevRadius + radius) );
      if(deltaX2 < 0){
        // down then left
        svgPath += ' s 0 ' + radius + ' ' + negRadius + ' ' + radius;
      } else if (deltaX2 > 0){
        // down then right
        svgPath += ' s 0 ' + ' ' + radius + ' ' + radius + ' ' + radius;
      }
    } else if (deltaX < 0){
      // left
      console.log('left ', deltaX);
      if (svgPath == 'M') svgPath += ' ' + (points[0].x - radius) + ' ' + (points[0].y);
      svgPath += ' l ' + (deltaX + (prevRadius + radius)) + ' ' + (deltaY);

      if(deltaY2 < 0){
        // left, then up
        svgPath += ' s ' + negRadius + ' 0 ' + negRadius + ' ' + negRadius;
      }
      if(deltaY2 > 0){
        // left, then down
        svgPath += ' s ' + negRadius + ' 0 ' + negRadius + ' '+  radius;
      }
    } else if (deltaX > 0){
        // right
        console.log('right ',   deltaX, ' - (',  prevRadius, ' + ' + radius, ')');
        if (svgPath == 'M') svgPath += ' ' + (points[0].x + radius) + ' ' + (points[0].y);

        svgPath += ' l ' + (deltaX - (prevRadius + radius)) + ' ' + (deltaY);
        if(deltaY2 > 0){
          console.log('- then curve down ', radius);
          // right, then down
          svgPath += ' s ' + radius + ' 0 ' + radius + ' ' + radius;
        }
        if(deltaY2 < 0){
          console.log('- then curve up ', radius);
          // right, then up
          svgPath += ' s ' + ' ' + radius + ' 0 ' + radius + ' ' + negRadius;
        }
    }

  }

  // close the shape

  console.log('svgPath: ', svgPath);
  return svgPath;
}


  render() {


    var rects = this.rectPoints
    var hull = this.orthoConvexHull(rects, this.props.pathOffset);
    //hull.reverse();
    var roundedHullStr = this.roundedSVGPath(hull, this.props.cornerRadius);
    console.log('hull', hull);

    var svgPointsStr = '';
    for(var i=0; i<hull.length; i++){
      console.log('point: ', hull[i].x);
      svgPointsStr = svgPointsStr + hull[i].x + ',' + hull[i].y + ' ';
    }

    var svgRects = rects.map(function(rect, id){
      return(
          <rect fill="grey" x={rect.x1} y={rect.y1} width={rect.x2-rect.x1} height={rect.y2-rect.y1} key={'svgrect_' + id}/>
      )

    });

    // <path fill="green" opacity=".125" stroke="green" d={roundedHullStr}/>
    // <path fill="orange" opacity=".125" stroke="green" d={roundedHullStr2}/>
      return(
        <div className='svgContainer' style={{width:'100%', height:'100%'}}>
          <svg width='100%' height='100%'>
            {svgRects}
            <polyline fill="none" opacity=".25" stroke="blue" points={svgPointsStr}/>
            <path fill="purple" opacity=".5" stroke="black" d={roundedHullStr}/>
          </svg>
        </div>
      );
    // var elapsed = Math.round(this.props.elapsed  / radius0);
    // var seconds = elapsed / radius + (elapsed % radius ? '' : '.0' );
    // var message =
    //   `React has been successfully running for ${seconds} seconds.`;
    //
    // return <p>{message}</p>;
  }
}
