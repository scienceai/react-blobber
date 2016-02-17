export function rect2rectPoints(rect) {
  if ('x1' in rect && 'y1' in rect && 'x2' in rect && 'y2' in rect) return rect;

  if ('x' in rect && 'y' in rect && 'width' in rect && 'height' in rect) {
    return {
      x1: rect.x,
      y1: rect.y,
      x2: rect.x + rect.width,
      y2: rect.y + rect.height,
    };
  } else {
    return { x1: 0, y1: 0, x2: 0, y2: 0 };
  }
}

export function orthoConvexHull(rects, offset) {
  //Orthogonal/X-Y Convex Hull
  let points = [];

  // find islands
  let islands = [];
  for (let i = 0; i< rects.length; i++) {
      let isIsland = true;

      for (let j = 0; j < rects.length; j++ ) {
        if (i != j) {
          if (rects[i].x1 >= rects[j].x1 && rects[i].x1 <= rects[j].x2) {
            isIsland = false;
          } else if (rects[i].x2 >= rects[j].x1 && rects[i].x2 <= rects[j].x2) {
            isIsland = false;
          } else if (rects[i].x1 <= rects[j].x1 && rects[i].x2 >= rects[j].x2) {
            isIsland = false;
          }
          if (rects[i].y1 >= rects[j].y1 && rects[i].y1 <= rects[j].y2) {
            isIsland = false;
          } else if (rects[i].y2 >= rects[j].y1 && rects[i].y2 <= rects[j].y2) {
            isIsland = false;
          } else if (rects[i].y1 <= rects[j].y1 && rects[i].y2 >= rects[j].y2) {
              isIsland = false;
          }
        }
      }
      if (isIsland === true) islands.push(i);
      //console.log('isLand?', i, isIsland);
  }
  //console.log('islands', islands);
  // find nearest neighbor

  let nearestRect;
  const connectorThickness = 1;
  let rectConnects = [];
  for (let i = 0; i< islands.length; i++) {
    nearestRect = false;
    let xMin = 100000;
    let yMin = 100000;
    let deltaMin = 100000;
    for (let j = 0; j < rects.length; j++ ) {
      //console.log(i,j);

      if (islands[i] != j) {

        let xDelta = (rects[islands[i]].x1 - rects[j].x2 );
        //console.log('delta for ',i , rects[islands[i]].x1, '-', rects[j].x2 );

        let yDelta = (rects[islands[i]].y2 - rects[j].y1);
        let delta = Math.sqrt(Math.abs(xDelta * xDelta) + Math.abs(yDelta * yDelta));
        if (delta < deltaMin) {
          deltaMin = delta;
          nearestRect = j;
          xMin = xDelta;
          yMin = yDelta;
        }
        // let xDelta = (rects[islands[i]].x2 - rects[j].x1);
        // let yDelta = (rects[islands[i]].y1 - rects[j].y2);
        // let delta = Math.sqrt(Math.abs(xDelta * xDelta) + Math.abs(yDelta * yDelta));
        // if (delta < deltaMin) {
        //   deltaMin = delta;
        //   nearestRect = j;
        // }

        // if ( Math.abs(rects[islands[i]].x2 - rects[j].x1) < Math.abs(xMin) ) {
        //   xMin =(rects[islands[i]].x2 - rects[j].x1);
        //   if (Math.abs(xMin) < deltaMin) {
        //     deltaMin = Math.abs(xMin);
        //     nearestRect = j;
        //   }
        // }
        // if (Math.abs(rects[islands[i]].y2 - rects[j].y1) < Math.abs(yMin)) {
        //   yMin =(rects[islands[i]].y2 - rects[j].y1);
        //   if (Math.abs(yMin) < deltaMin) {
        //     deltaMin = Math.abs(yMin);
        //     nearestRect = j;
        //   }
        // }
        // if (Math.abs(rects[islands[i]].x1 - rects[j].x2) < Math.abs(xMin)) {
        //   xMin =(rects[islands[i]].x1 - rects[j].x2);
        //   if (Math.abs(xMin) < deltaMin) {
        //     deltaMin = Math.abs(xMin);
        //     nearestRect = j;
        //   }
        // }
        // if (Math.abs(rects[islands[i]].y1 - rects[j].y2) < Math.abs(yMin)) {
        //   yMin =(rects[islands[i]].y1 - rects[j].y2);
        //   if (Math.abs(yMin) < deltaMin) {
        //     deltaMin = Math.abs(yMin);
        //     nearestRect = j;
        //   }
        // }

      }
    }
    if (nearestRect !== false) {
      //console.log('island neighbors: ', islands[i], nearestRect );
      //rectConnects.push({x1:rects[islands[i]].x1, y1:rects[islands[i]].y1, x2:rects[islands[i]].x1+10, y2:rects[islands[i]].y1+10});
      //rectConnects.push({x1:rects[nearestRect].x1, y1:rects[nearestRect].y1, x2:rects[nearestRect].x1+offset, y2:rects[nearestRect].y1+offset});
      let cX1, cX2, cY1, cY2;
      if (xMin > 0) {
        //console.log('island on right');
        // island is to the right of neighbor
        cX1 = rects[nearestRect].x2 - connectorThickness;
        cX2 = rects[islands[i]].x1 + connectorThickness;
        //rectConnects.push({x1:rects[nearestRect].x2, y1:rects[nearestRect].y1, x2:rects[islands[i]].x1+offset, y2:rects[nearestRect].y1+offset});
      } else {
        //island is to the left
        //console.log('island on left');
        cX1 = rects[islands[i]].x2 - connectorThickness;
        cX2 = rects[nearestRect].x1 + connectorThickness;
        //rectConnects.push({ x1:rects[islands[i]].x2, y1:rects[islands[i]].y1, x2:rects[nearestRect].x1 + offset, y2:rects[islands[i]].y1 + offset,});
      }
      if (yMin> 0) {
        // island is below neighbor
        //cY1 = rects[islands[i]].y1;
        //cY2 = rects[islands[i]].y1 + connectorThickness;
        cY1 = rects[nearestRect].y2 + ((rects[islands[i]].y1 - rects[nearestRect].y2)  / 2);
        cY2 = cY1 + connectorThickness;
      } else {
        // island is above neighbor
          //cY1 = rects[nearestRect].y1;
          cY1 = rects[islands[i]].y2 + ((rects[nearestRect].y1 -rects[islands[i]].y2)/2);
          cY2 = cY1 + connectorThickness;
      }
      //console.log('connector ', cX1, cY1, cX2, cY2);
      rectConnects.push({x1:cX1, y1:cY1, x2:cX2, y2:cY2});

    }
  }

  // add connectors to rects
  rects.push.apply(rects, rectConnects);

  // get all the points in the rect Array and add offset
  for (let i = 0; i < rects.length; i++) {
    rects[i].x1 = rects[i].x1 - offset;
    rects[i].y1 = rects[i].y1 - offset;
    rects[i].x2 = rects[i].x2 + offset;
    rects[i].y2 = rects[i].y2 + offset;
  }

  // convert rects to points
  for (let i = 0; i < rects.length; i++) {
    points.push({x: rects[i].x1, y: rects[i].y1});
    points.push({x: rects[i].x1, y: rects[i].y2});
    points.push({x: rects[i].x2, y: rects[i].y2});
    points.push({x: rects[i].x2, y: rects[i].y1});
  }


  //console.log('points: ', JSON.stringify(points));
  // find min and max values of y
  let min_y = Number.POSITIVE_INFINITY;
  let min_yPoint;
  let max_y = Number.NEGATIVE_INFINITY;
  let max_yPoint;
  let min_x = Number.POSITIVE_INFINITY;
  let min_xPoint;
  let max_x = Number.NEGATIVE_INFINITY;
  let max_xPoint;
  let tmp;
  for (let i = points.length-1; i>=0; i--) {
    tmp = points[i].y;
    if (tmp < min_y) {
      min_yPoint = points[i];
      min_y = points[i].y;
    } else if (tmp > max_y) {
      max_yPoint = points[i];
      max_y = points[i].y;
    }
    tmp = points[i].x;
    if (tmp < min_x) {
      min_xPoint = points[i];
      min_x = points[i].x;
    } else if (tmp > max_x) {
      max_xPoint = points[i];
      max_x = points[i].x;
    }
  }
  // sort points by x coordinate, then by y
  points.sort(function(a,b) {
      if (a.x == b.x) return a.y-b.y;
      return a.x-b.x;

  });

  //console.log('sorted points: ', JSON.stringify(points));

  //console.log('minYPoint: ', min_yPoint);
  //console.log('maxYPoint: ', max_yPoint);

  // duplicate array
  let reversedPoints = points.slice(0);
  // and reverse
  reversedPoints.reverse();

  // construct upper paths
  let upperLeft = orthoBuildUpperLeft(points, min_yPoint);
  //console.log('upperLeft: ', upperLeft );
  let upperRight = orthoBuildUpperRight(reversedPoints, max_xPoint);
  //console.log('upperRight: ', upperRight );

  // construct lower paths
  let lowerLeft = orthoBuildLowerLeft(points, max_yPoint);
  //console.log('lowerLeft: ', lowerLeft);

  // resort by y then x
  points.sort(function(a,b) {
      if (a.y == b.y) return a.x-b.x;
      return b.y-a.y;
  });
  let lowerRight = orthoBuildLowerRight(points, max_yPoint);
  //console.log('lowerRight: ', lowerRight);

  upperRight.reverse();
  lowerRight.reverse();
  lowerLeft.reverse();


  let hull = upperLeft.concat(upperRight, lowerRight, lowerLeft);
  //console.log('hull', JSON.stringify(hull));

  //  remove all duplicate points
  hull = hull.reduce((prev, curr) => {
    if (!prev.some(point => point.x === curr.x && point.y === curr.y)) {
      prev.push(curr);
    }
    return prev;
  }, []);

  // clean up redundant points on a line
  let hullLength = 0;
  while(hull.length != hullLength && hull.length > 2) {

    hullLength = hull.length;

    for (let i = 0; i<hull.length; i++) {
      let x2i = i+1;
      if (x2i > hull.length-1) x2i = (x2i - hull.length);
      let x3i = i+2;
      if (x3i > hull.length-1) x3i = (x3i - hull.length);
      //console.log('is ', hull.length, i, x2i, x3i );
      if (hull[i].x == hull[x2i].x && hull[i].x == hull[x3i].x) {
        //console.log('remove: ', hull[i-2].x, hull[i-1].x, hull[i].x );
        hull.splice(x2i, 1);
      }
    }
    for (let i = 0; i<hull.length; i++) {
      let y2i = i+1;
      if (y2i > hull.length-1) y2i = (y2i - hull.length);
      let y3i = i+2;
      if (y3i > hull.length-1) y3i = (y3i - hull.length);
      if (hull[i].y == hull[y2i].y && hull[i].y == hull[y3i].y) {
        //console.log('remove: ', hull[i-2].x, hull[i-1].x, hull[i].x );
        hull.splice(y2i, 1);
      }
    }
  }
  let closeLine = [
    {x: hull[hull.length-1].x, y: hull[hull.length-1].y},
    {x: hull[0].x, y: hull[0].y}
  ];
  hull = hull.concat([{x: hull[0].x, y: hull[0].y}]);

  //console.log('closeLine: ', JSON.stringify(closeLine));
  //console.log('cleaned hull', JSON.stringify(hull));
  return(hull);
}


function orthoBuildLowerLeft(points) {
  let section = [points[0]];

  for (let i = 0; i < points.length; i++) {
    //console.log('x,y: ', points[i].x, points[i].y);
    if (section.length > 1) {
      if (points[i].y == section[section.length-1].y) {
        // horizontal line
        if (points[i].x >section[section.length-1].x) {
          //right
          let y = section[section.length-1].y;
          let x = points[i].x;
          section.push({x: x, y: y});
          section.push(points[i]);
        }
      }
      if (points[i].x == section[section.length-1].x) {
        // vertical line
        if (points[i].y > section[section.length-1].y) {

          section.push(points[i]);
        }
      }
      if (points[i].y > section[section.length-1].y) {
        if (points[i].x > section[section.length-1].x) {
          // down right
          //section[section.length-1].y = points[i].y
          let y = section[section.length-1].y;
          let x = points[i].x;
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

function orthoBuildLowerRight(points, max_yPoint) {
  let section = [max_yPoint];

  for (let i = 0; i < points.length; i++) {
    //console.log('lr x,y: ', points[i].x, points[i].y);
    if (section.length >= 1) {
      if (points[i].y == section[section.length-1].y) {
        // horizontal line
        if (points[i].x >= section[section.length-1].x) {
          //right
          section.push(points[i]);
        }
      }
      if (points[i].x == section[section.length-1].x) {
        // vertical line
        if (points[i].y <= section[section.length-1].y) {
          section.push(points[i]);
        }
      }
      if (points[i].x >= section[section.length-1].x) {
        if (points[i].y <= section[section.length-1].y) {
          // up right
          //section[section.length-1].x = points[i].x
          //console.log('up right')
          let x = section[section.length-1].x;
          let y = points[i].y;
          section.push({x: x, y: y});
          section.push(points[i]);
        }
      }
    }
  }
  return section;
}

function orthoBuildUpperLeft(points, min_yPoint) {
  let section = [points[0]];

  for (let i = 0; i < points.length; i++) {
    //console.log('x,y: ', points[i].x, points[i].y);
    if (section.length > 1) {
      if (points[i].y == section[section.length-1].y) {
        // horizontal line
        if (points[i].x > section[section.length-1].x) {
          //right
          section.push(points[i]);
        }
      }
      if (points[i].x == section[section.length-1].x) {
        // vertical line
        if (points[i].y < section[section.length-1].y) {
          section.push(points[i]);
        }
      }
      if (points[i].y < section[section.length-1].y) {
        if (points[i].x > section[section.length-1].x) {
          // up right
          //section[section.length-1].x = points[i].x
          let y = section[section.length-1].y;
          let x = points[i].x;
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

function orthoBuildUpperRight(points, max_xPoint) {
  let section = [];
  //console.log('buildUpperRight');
  for (let i = 0; i < points.length; i++) {
    if (section.length > 1) {
      if (points[i].y == section[section.length-1].y) {
        // horizontal line
        if (points[i].x < section[section.length-1].x) {
          section.push(points[i]);
        }
      }
      if (points[i].x == section[section.length-1].x) {
        // vertical line
        if (points[i].y < section[section.length-1].y) {
          section.push(points[i]);
        }
      }
      if (points[i].y < section[section.length-1].y) {
        if (points[i].x < section[section.length-1].x) {
          // up left
          //section[section.length-1].x = points[i].x
          let y = section[section.length-1].y;
          let x = points[i].x;
          section.push({x: x, y: y});
          section.push(points[i]);
        }
      }
    } else {
      // first point
      if (points[i].x == max_xPoint.x) {
        section.push(points[i]);
      }
    }
  }
  return section;
}

export function roundedSVGPath(points, r) {

  let svgPath;

  if (!points.length) return;

  //compute the middle of the first line as start-stop-point:
  let deltaX, deltaY, deltaX2, deltaY2, deltaX3, deltaY3, xPerY, startX, startY;
  let radius1, radius2, radius3;

  svgPath = 'M';
  let prevRadius, radius;
  prevRadius = r;
  radius = r;
  deltaX = points[1].x - points[0].x;
  deltaY = points[1].y - points[0].y;
  if (deltaX != 0 && Math.abs(deltaX)/2 < prevRadius) {
    prevRadius = Math.abs(deltaX)/2;
  }
  if (deltaY != 0 && Math.abs(deltaY)/2 < prevRadius) {
    prevRadius = Math.abs(deltaY)/2;
  }
  radius = prevRadius;
  //console.log('prevRadius', prevRadius);

  for (let i = 1; i < points.length; i++) {

    // some logic to deel with closing the loop
    if (i == 0) {
      //console.log('i==0');
      deltaX = points[i].x - points[points.length-1].x;
      deltaY = points[i].y - points[points.length-1].y;
      deltaX2 = points[i+1].x - points[i].x;
      deltaY2 = points[i+1].y - points[i].y;
      deltaX3 = points[i+2].x - points[i+1].x;
      deltaY3 = points[i+2].y - points[i+1].y;
    } else if (i < points.length-2) {
      //console.log('i<length-2', i);
      deltaX = points[i].x - points[i-1].x;
      deltaY = points[i].y - points[i-1].y;
      deltaX2 = points[i+1].x - points[i].x;
      deltaY2 = points[i+1].y - points[i].y;
      deltaX3 = points[i+2].x - points[i+1].x;
      deltaY3 = points[i+2].y - points[i+1].y;
    } else if (i == points.length-2) {
      //console.log('i==length-2', points.length-2, i);
      deltaX = points[i].x - points[i-1].x;
      deltaY = points[i].y - points[i-1].y;
      deltaX2 = points[i+1].x - points[i].x;
      deltaY2 = points[i+1].y - points[i].y;
      deltaX3 = points[1].x - points[0].x;
      deltaY3 = points[1].y - points[0].y;
    } else if (i == points.length-1) {
      //console.log('i==length-1', points.length-1, i);
      deltaX = points[i].x - points[i-1].x;
      deltaY = points[i].y - points[i-1].y;
      deltaX2 = points[1].x - points[0].x;
      deltaY2 = points[1].y - points[0].y;
      deltaX3 = points[2].x - points[1].x;
      deltaY3 = points[2].y - points[1].y;
    }

    //console.log('delta x y: ', i,  deltaX, deltaY);
    //console.log('delta2 x y: ', i,  deltaX2, deltaY2);
    //console.log('delta3 x y: ', i,  deltaX3, deltaY3);
    let rX = 100;
    let rY = 100;

    radius1 = radius2 = radius3 = r;

    if (deltaX != 0 && Math.abs(deltaX)/2 < radius1) {
      radius1 = Math.abs(deltaX)/2;
    }
    if (deltaY != 0 && Math.abs(deltaY)/2 < radius1) {
      radius1 = Math.abs(deltaY)/2;
    }
    if (deltaX2 != 0 && Math.abs(deltaX2)/2 < radius2) {
      radius2 = Math.abs(deltaX2)/2;
    }
    if (deltaY2 != 0 && Math.abs(deltaY2)/2 < radius2) {
      radius2 = Math.abs(deltaY2)/2;
    }
    if (deltaX3 != 0 && Math.abs(deltaX3)/2 < radius3) {
      radius3 = Math.abs(deltaX3)/2;
    }
    if (deltaY3 != 0 && Math.abs(deltaY3)/2 < radius3) {
      radius3 = Math.abs(deltaY3)/2;
    }
    prevRadius = radius;
    radius = Math.min(radius1, radius2 );
    let negRadius = -1 * radius;

    //console.log('radius: ', radius, ' from ', radius1, radius2, radius3);
    //svgPath += ' L ' + (points[i].x ) + ' ' + (points[i].y );

    if (deltaY < 0) {
      // up

      if (svgPath == 'M') {
        //console.log('start ', points[0].x, ',', points[0].y, ' - ', radius);
        svgPath += ' ' + points[0].x + ' ' + (points[0].y - radius);
      }
      //console.log('up ', deltaY);
      svgPath += ' l ' + (deltaX) + ' ' + (deltaY + prevRadius + radius);

      if (deltaX2 < 0) {
        // up then left
        svgPath += ' s 0 ' + negRadius + ' ' + negRadius + ' ' + negRadius;
      } else if (deltaX2 > 0) {
        // up then right
        //console.log(' then curve right ', radius);
        svgPath += ' s 0 ' + negRadius + ' ' + radius + ' ' + negRadius;
      }
    } else if (deltaY > 0) {
      //down
      //console.log('down ', deltaY);
      if (svgPath == 'M') svgPath += ' ' + points[0].x + ' ' + (points[0].y + radius);

      svgPath += ' l ' + (deltaX) + ' ' + (deltaY - (prevRadius + radius) );
      if (deltaX2 < 0) {
        // down then left
        svgPath += ' s 0 ' + radius + ' ' + negRadius + ' ' + radius;
      } else if (deltaX2 > 0) {
        // down then right
        svgPath += ' s 0 ' + ' ' + radius + ' ' + radius + ' ' + radius;
      }
    } else if (deltaX < 0) {
      // left

      if (svgPath == 'M') {
        //console.log('start ', points[0].x, '-',  radius, ',', points[0].y);
        svgPath += ' ' + (points[0].x - radius) + ' ' + (points[0].y);
      }

      //console.log('left ', deltaX);

      svgPath += ' l ' + (deltaX + (prevRadius + radius)) + ' ' + (deltaY);

      if (deltaY2 < 0) {
        // left, then up
          //console.log('- then curve up ', radius);
        svgPath += ' s ' + negRadius + ' 0 ' + negRadius + ' ' + negRadius;
      }
      if (deltaY2 > 0) {
        // left, then down
        //console.log('- then curve down ', radius);
        svgPath += ' s ' + negRadius + ' 0 ' + negRadius + ' '+  radius;
      }
    } else if (deltaX > 0) {
        // right

        if (svgPath == 'M') {
            //console.log('start ', points[0].x, '+',  radius, ',', points[0].y);
           svgPath += ' ' + (points[0].x + prevRadius) + ' ' + (points[0].y);
        }
        //console.log('right ',   deltaX, ' - (',  prevRadius, ' + ' + radius, ')');

        svgPath += ' l ' + (deltaX - (prevRadius + radius)) + ' ' + (deltaY);
        if (deltaY2 > 0) {
          //console.log('- then curve down ', radius);
          // right, then down
          svgPath += ' s ' + radius + ' 0 ' + radius + ' ' + radius;
        }
        if (deltaY2 < 0) {
          //console.log('- then curve up ', radius);
          // right, then up
          svgPath += ' s ' + ' ' + radius + ' 0 ' + radius + ' ' + negRadius;
        }
    }

  }
  // close the shape
  //console.log('svgPath: ', svgPath);
  return svgPath;
}
