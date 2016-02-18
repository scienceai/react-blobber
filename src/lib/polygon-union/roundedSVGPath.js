export default function roundedSVGPath(points, r) {

  let svgPath;

  if (!points.length) return;

  //console.log('roundedSVGPath: ', points);

  // see if path is a closed loop;
  if (points[0][0] !== points[points.length-1][0] || points[0][1] !== points[points.length-1][1]) {
    // close the loop
    points.push(points[0]);
    //console.log('closed roundedSVGPath: ', points);
  }

  //compute the middle of the first line as start-stop-point:
  let deltaX, deltaY, deltaX2, deltaY2, deltaX3, deltaY3, startX, startY;
  let radius1, radius2, radius3;

  svgPath = 'M';
  let prevRadius, radius;
  prevRadius = r;
  radius = r;
  deltaX = points[1][0] - points[0][0];
  deltaY = points[1][1] - points[0][1];

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
    if (i === 0) {
      //console.log('i==0');
      deltaX = points[i][0] - points[points.length-1][0];
      deltaY = points[i][1] - points[points.length-1][1];
      deltaX2 = points[i+1][0] - points[i][0];
      deltaY2 = points[i+1][1] - points[i][1];
      deltaX3 = points[i+2][0] - points[i+1][0];
      deltaY3 = points[i+2][1] - points[i+1][1];
    } else if (i < points.length-2) {
      //console.log('i<length-2', i);
      deltaX = points[i][0] - points[i-1][0];
      deltaY = points[i][1] - points[i-1][1];
      deltaX2 = points[i+1][0] - points[i][0];
      deltaY2 = points[i+1][1] - points[i][1];
      deltaX3 = points[i+2][0] - points[i+1][0];
      deltaY3 = points[i+2][1] - points[i+1][1];
    } else if (i == points.length-2) {
      //console.log('i==length-2', points.length-2, i);
      deltaX = points[i][0] - points[i-1][0];
      deltaY = points[i][1] - points[i-1][1];
      deltaX2 = points[i+1][0] - points[i][0];
      deltaY2 = points[i+1][1] - points[i][1];
      deltaX3 = points[1][0] - points[0][0];
      deltaY3 = points[1][1] - points[0][1];
    }else if (i == points.length-1) {
      //console.log('i==length-1', points.length-1, i);
      deltaX = points[i][0] - points[i-1][0];
      deltaY = points[i][1] - points[i-1][1];
      deltaX2 = points[1][0] - points[0][0];
      deltaY2 = points[1][1] - points[0][1];
      deltaX3 = points[2][0] - points[1][0];
      deltaY3 = points[2][1] - points[1][1];
    }

    //console.log('delta x y: ', i,  deltaX, deltaY);
    //console.log('delta2 x y: ', i,  deltaX2, deltaY2);
    //console.log('delta3 x y: ', i,  deltaX3, deltaY3);
    let rX = 1000;
    let rY = 1000;

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
    //svgPath += ' L ' + (points[i][0] ) + ' ' + (points[i][1] );

    if (deltaY < 0) {
      // up

      if (svgPath == 'M') {
        // console.log('start ', points[0][0], ',', points[0][1], ' - ', radius);
        svgPath += ' ' + points[0][0] + ' ' + (points[0][1] - prevRadius);
      }
      // console.log('up ', deltaY);
      svgPath += ' l ' + (deltaX) + ' ' + (deltaY + prevRadius + radius);

      if (deltaX2 < 0) {
        // up then left
        svgPath += ' s 0 ' + (negRadius) + ' ' + (negRadius) + ' ' + (negRadius);
      } else if (deltaX2 > 0) {
        // up then right
        //console.log(' then curve right ', radius);
        svgPath += ' s 0 ' + negRadius + ' ' + radius + ' ' + negRadius;
      }
    } else if (deltaY > 0) {
      //down

      if (svgPath == 'M') {
          // console.log('start')
         svgPath += ' ' + points[0][0] + ' ' + (points[0][1] + prevRadius);
      }
      // console.log('down ', deltaY);

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
        // console.log('start ', points[0][0], '-',  radius, ',', points[0][1]);
        svgPath += ' ' + (points[0][0] - (prevRadius)) + ' ' + (points[0][1]);
      }

      // console.log('left ', deltaX, prevRadius, radius);

      svgPath += ' l ' + (deltaX + (prevRadius + radius)) + ' ' + (deltaY);

      if (deltaY2 < 0) {
        // left, then up
          //console.log('- then curve up ', radius);
        svgPath += ' s ' + (negRadius) + ' 0 ' + (negRadius) + ' ' + (negRadius);
      }
      if (deltaY2 > 0) {
        // left, then down
          //console.log('- then curve down ', radius);
        svgPath += ' s ' + negRadius + ' 0 ' + negRadius + ' '+  radius;
      }
    } else if (deltaX > 0) {
        // right
        if (svgPath === 'M') {
            // console.log('start ', points[0][0], '+',  radius, ',', points[0][1]);
           svgPath += ' ' + (points[0][0] + prevRadius) + ' ' + (points[0][1]);
        }
        // console.log('right ',   deltaX, ' - (',  prevRadius, ' + ' + radius, ')');

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
  svgPath += ' z';
  // console.log('rounded svgPath: ', svgPath);
  return svgPath;
}
