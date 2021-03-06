import polygonBoolean from 'poly-bool';

export default function makePolygonGroups(rects, pathOffset) {
  const polygons = unionRects(offsetRects(rects, pathOffset), pathOffset);
  const cleanedPolygons = polygons.map(poly => cleanPolygon(poly));
  return cleanedPolygons;
}

function offsetRects(rects, offset) {
  // offsets all the points in a rect
  for (let i = 0; i < rects.length; i++) {
    rects[i].x1 = rects[i].x1 - offset;
    rects[i].y1 = rects[i].y1 - offset;
    rects[i].x2 = rects[i].x2 + offset;
    rects[i].y2 = rects[i].y2 + offset;
  }
  return rects;
}

function unionRects(rects, pathOffset) {
  //console.log('unionRects: ', rects);
  let initialPoly = polygonPointArr(rects[0]);
  let polygons = [initialPoly];// todo - don't init?
  //console.log(' - polygon:', polygon);
  rects.forEach((rect, i) => {
    //console.log(' - rect:', rect);
    let pointArr = [polygonPointArr(rect)];
    //console.log(' - pointArr:', pointArr);
    polygons = polygonBoolean(pointArr, polygons, 'or');
    //console.log(' - polygon:', polygon);
  });
  //console.log(' - unionRects returning: ', polygons);
  if(polygons.length > 1){
    // connect polygon islands
    polygons = joinPolygons(polygons, pathOffset, 'elastic');
    //console.log(' - joinPolygons returning: ', polygons);
  }
  return polygons;
}

function polygonPointArr(rect) {
  const { x1, y1, x2, y2 } = rect;
  return [ [x1, y1], [x2, y1], [x2, y2], [x1, y2] ];
}

function joinPolygons(polygonsArr, minBridgeThickness, style){
  //console.log('joinPolygons start data ', JSON.stringify(polygonsArr));

  // join the polygons until there is only 1 polygon
  // limit prevents infinite loops on unsolvable problem (probably indicating a bug)
  let i = 0;
  let limit = polygonsArr.length +2;
  while(polygonsArr.length > 1 && i <= limit){
    i++;
    let bridgeData = findNearestPointsInAll(polygonsArr);
    //console.log('join', polygonsArr);

    let bridgeRect;
    let startLine = bridgeData.lineA;
    let endLine = bridgeData.lineB;
    let startPoint = bridgeData.pointA;
    let endPoint = bridgeData.pointB;

    if(bridgeData.pointA[0] > bridgeData.pointB[0]){
      startLine = bridgeData.lineB;
      endLine = bridgeData.lineA;
      startPoint = bridgeData.pointB;
      endPoint = bridgeData.pointA;
    }

    if(bridgeData.overlap == true){
      if (startLine[0][1] == startLine[1][1]){
        //console.log('horizontal parallel lines - make vertical bridge')
        // find the overlapping x pixels - make a vertical bridge
        let rectX1 = startLine[0][0] > endLine[0][0] ? startLine[0][0] : endLine[0][0];
        let rectX2 = startLine[1][0] < endLine[1][0] ? startLine[1][0] : endLine[1][0];
        let rectY1 = startLine[0][1];
        let rectY2 = endLine[0][1];

        rectX2 = rectX2 - rectX1 < minBridgeThickness ? rectX1 + minBridgeThickness : rectX2;
        let deltaX = Math.abs(rectX2 - rectX1);
        let deltaY = Math.abs(rectY2 - rectY1);
        let thickness = minBridgeThickness;

        if(style == 'elastic'){
          thickness = deltaX * ((1/(deltaY*deltaY))*deltaX);
          thickness = thickness < minBridgeThickness ? minBridgeThickness : thickness;
          thickness = thickness > deltaX ? deltaX : thickness;
        }
        let bridgeX1 = ((rectX2 - rectX1)/2) - (thickness/2) + rectX1;
        let bridgeX2 = ((rectX2 - rectX1)/2) + (thickness/2) + rectX1;

        // bridgeX1 = bridgeX1 < rectX1 ? rectX1 : bridgeX1;
        // bridgeX2 = bridgeX2 > rectX2 ? rectX2 : bridgeX2;

        bridgeRect =  [[bridgeX1, rectY1], [bridgeX2, rectY1], [bridgeX2, rectY2], [bridgeX1, rectY2]];
        //console.log('bridgeRect ', bridgeRect);
        polygonsArr = polygonBoolean(polygonsArr, bridgeRect, 'or');

      } else {
        // lineDirection == 'v' - build horizontal bridge
        //console.log('vertical parallel lines - make horizontal bridge');
        // - find the overlapping Y pixels
        let rectX1 = startLine[0][0];
        let rectX2 = endLine[0][0];
        let rectY1 = startLine[0][1] > endLine[0][1] ? startLine[0][1] : endLine[0][1];
        let rectY2 = startLine[1][1] < endLine[1][1] ? startLine[1][1] : endLine[1][1];
        rectY2 = rectY2 - rectY1 < minBridgeThickness ? rectY1 + minBridgeThickness : rectY2;

        let deltaX = Math.abs(rectX2 - rectX1);
        let deltaY = Math.abs(rectY2 - rectY1);
        let thickness = minBridgeThickness;

        if(style == 'elastic'){
          thickness = deltaY * ((1/(deltaX*deltaX))*deltaY);
          thickness = thickness < minBridgeThickness ? minBridgeThickness : thickness;
          thickness = thickness > deltaY ? deltaY : thickness;
        }
        let bridgeY1 = ((rectY2 - rectY1)/2) - (thickness/2) + rectY1;
        let bridgeY2 = ((rectY2 - rectY1)/2) + (thickness/2) + rectY1;

        bridgeRect =  [[rectX1, bridgeY1], [rectX2, bridgeY1], [rectX2, bridgeY2], [rectX1, bridgeY2]];
        //console.log('bridgeRect ', bridgeRect);
        polygonsArr = polygonBoolean(polygonsArr, bridgeRect, 'or');

      }
    } else {
      // points are orthoganol to each other
      //console.log('adjascent');

      if(startLine[0][0] == startLine[1][0]){
        //start line is vertical - build horizontal bridge segment
        //console.log('- h then v');
        let startX = startPoint[0];
        let endX = endPoint[0] + minBridgeThickness;
        //let startY = startPoint[1] - minBridgeThickness;
        //let endY = startPoint[1];
        // if(startPoint[1] == startLine[0][1] && startPoint[1] < startLine[1][1]){
        //   startY = startPoint[1];
        //   endY = startPoint[1] + minBridgeThickness;
        // }

        let startY = startPoint[1] < startLine[1][1] ? startPoint[1] : startPoint[1] - minBridgeThickness;
        let endY =  startPoint[1] < startLine[1][1] ? startPoint[1] + minBridgeThickness : startPoint[1];

        let rectX1 = startX;
        let rectX2 = endX;
        let rectY1 = startY;
        let rectY2 = endY;

        bridgeRect =  [[rectX1, rectY1], [rectX2, rectY1], [rectX2, rectY2], [rectX1, rectY2]];
        //console.log('bridgeRect ', bridgeRect);
        polygonsArr = polygonBoolean(polygonsArr, bridgeRect, 'or');

        // build vertical bridge segment
        startY = rectY1;
        endY = endPoint[1];
        startX = rectX2 - minBridgeThickness;
        endX = rectX2;
        if(startPoint[0] == startLine[0][0] && startPoint[0] < startLine[1][0]){
          startX = startPoint[0];
          endX = startPoint[0] + minBridgeThickness;
        }
        rectX1 = startX;
        rectX2 = endX;
        rectY1 = startY;
        rectY2 = endY;

        bridgeRect =  [[rectX1, rectY1], [rectX2, rectY1], [rectX2, rectY2], [rectX1, rectY2]];
        //console.log('bridgeRect ', bridgeRect);
        polygonsArr = polygonBoolean(polygonsArr, bridgeRect, 'or');

      } else {
        // line A is Horizontal - build vertical bridge segment
        //console.log('- v then h');

        let startY = startPoint[1];
        let endY = endPoint[1];

        // let startX = startPoint[0] < endPoint[0] ? startPoint[0] - minBridgeThickness : startPoint[0];
        // let endX = startPoint[0] < endPoint[0] ? startPoint[0]: startPoint[0] - minBridgeThickness;

        let startX = startPoint[0] < startLine[1][0] ? startPoint[0] : startPoint[0] - minBridgeThickness;
        let endX = startPoint[0] < startLine[1][0] ? startPoint[0] + minBridgeThickness : startPoint[0] ;

        let rectX1 = startX;
        let rectX2 = endX;
        let rectY1 = startY;
        let rectY2 = endY;

        bridgeRect =  [[rectX1, rectY1], [rectX2, rectY1], [rectX2, rectY2], [rectX1, rectY2]];
        //console.log('bridgeRect ', bridgeRect);
        polygonsArr = polygonBoolean(polygonsArr, bridgeRect, 'or');

        // build horizontal line segment

        //console.log('startLine: ', startLine);
        //console.log('endLine: ', endLine);
        startY = endPoint[1] < endLine[1][1] ? endPoint[1] : endPoint[1] - minBridgeThickness;
        endY =  endPoint[1] < endLine[1][1] ? endPoint[1] + minBridgeThickness : endPoint[1];

        startX = rectX1;
        endX = endPoint[0] + minBridgeThickness;
        if(startPoint[0] == startLine[0][0] && startPoint[0] < startLine[1][0]){
          startX = startPoint[0];
          endX = startPoint[0] + minBridgeThickness;
        }
        rectX1 = startX;
        rectX2 = endX;
        rectY1 = startY;
        rectY2 = endY;

        bridgeRect =  [[rectX1, rectY1], [rectX2, rectY1], [rectX2, rectY2], [rectX1, rectY2]];
        //console.log('bridgeRect ', bridgeRect);
        polygonsArr = polygonBoolean(polygonsArr, bridgeRect, 'or');
      }
    }

    // console.log('bridgePoints result data', bridgeRect);

    //console.log('joinPolygons result data', JSON.stringify(polygonsArr));
  }
  return(polygonsArr);
}

// a function to find the closest points between all of the polygons
function findNearestPointsInAll(polygonArr){
  let shortestDelta = Number.POSITIVE_INFINITY;
  let shortestResult;
  for (let i = 0; i < polygonArr.length; i++) {
    for (let j = i+1; j < polygonArr.length; j++) {
      let result = findNearestPoints(polygonArr[i], polygonArr[j]);
      if(result.delta < shortestDelta){
        shortestDelta = result.delta;
        shortestResult = result;
      }
    }
  }
  return shortestResult;
}

function findNearestPoints(polygonA, polygonB) {
  let closestDelta = Number.POSITIVE_INFINITY;
  let closestPoint = polygonA[0];
  let closestPointIndex = 0;
  let closestLine = [polygonB[0], polygonB[1]];

  // compare every point in PolygonA to every line in PolygonB and find closest distance
  polygonA.forEach( (pointA, indexA, arrA) => {
    let thisClosestPoint;
    let thisClosestLine;
    let thisClosestPointIndex;

    let thisClosestDelta = polygonB.reduce( (prev, curr, i, arr) => {
      let minDistance = 0;
      if (i < arr.length -1) {
        minDistance = pDistance(pointA[0], pointA[1], arr[i][0], arr[i][1], arr[i+1][0], arr[i+1][1]);
      } else {
        minDistance = pDistance(pointA[0], pointA[1], arr[i][0], arr[i][1], arr[0][0], arr[0][1]);
      }
      //console.log('minDistance ', minDistance);
      if (minDistance < prev) {
        thisClosestPoint = pointA;
        thisClosestPointIndex = indexA;

        let thisNextPointI = i+1 < arr.length ? i+1 : 0;
        let thisPrevPointI = i-1 >= 0 ? i-1 : arr.length-1;

        thisClosestLine = [arr[i], arr[thisNextPointI]];

        //console.log('compare: ', thisClosestPoint[1], arr[i][1], arr[thisNextPointI][1]);
        if((thisClosestPoint[0] == arr[i][0]) && (thisClosestPoint[0] == arr[thisNextPointI][0])){
          // all x's are same- aligned on Y axis
          thisClosestLine = [arr[i], arr[thisPrevPointI]];
          //console.log('swapping vertical line');
        } else if ((thisClosestPoint[1] == arr[i][1]) && (thisClosestPoint[1] == arr[thisNextPointI][1])){
          // all Y's are same- aligned on X axis
          thisClosestLine = [arr[i], arr[thisPrevPointI]];
          //console.log('swapping H line');
        }

        return minDistance;
      } else {
        return prev;
      }
    }, Number.POSITIVE_INFINITY);

    //console.log('thisClosestDelta ', thisClosestDelta);
    if (thisClosestDelta < closestDelta){
      closestDelta = thisClosestDelta;
      closestPoint = thisClosestPoint;
      closestLine = thisClosestLine;
      closestPointIndex = thisClosestPointIndex;
    }

  });

  //console.log('closestDelta: ', closestDelta);
  let lineDirection = 'p';
  let closestPointB = closestLine[0][0];
  let overlap = false;
  let lineA = [[0,0],[0,10]];

  // find if points are alligned
  //if(closestPoint[0] == closestLine[0][0]){
    // x coordinate is alligned
    //overlap = true;
    //console.log("x align");
  //} else if (closestPoint[1] == closestLine[0][1]){
    // y coordinate is alligned
    //overlap = true;
    //console.log("y align");
//  }

  let prevPointIndex = closestPointIndex-1;
  let nextPointIndex = closestPointIndex+1;

  if (prevPointIndex < 0) prevPointIndex = polygonA.length - 1;
  if (nextPointIndex > polygonA.length-1) nextPointIndex = 0;

  if(closestLine[0][0] == closestLine[1][0]){
    // Manage Vertical Lines
    lineDirection = 'v'
    // reorder points on line
    if(closestLine[0][1] > closestLine[1][1]){
      closestLine = [closestLine[1], closestLine[0]]
    }
    if(Math.abs(closestPoint[1] - closestLine[0][1]) < Math.abs(closestPoint[1] - closestLine[1][1]) ){
      closestPointB = closestLine[0];
    } else {
      closestPointB = closestLine[1];
    }
    if(closestPoint[1] >= closestLine[0][1] && closestPoint[1] <= closestLine[1][1]){
      overlap = true;
      if (polygonA[prevPointIndex][0] == closestPoint[0]){
        // prev point on PolygonA is vertically offset
        lineA = [polygonA[prevPointIndex], polygonA[closestPointIndex]];
      } else if (polygonA[nextPointIndex][0] == closestPoint[0]) {
        // next point is vertically offset
        lineA = [polygonA[nextPointIndex], polygonA[closestPointIndex]];
      }
      if(lineA[0][1] > lineA[1][1]){
        lineA = [lineA[1], lineA[0]]
      }
    } else {
      // nearest line is orthoganol (non overlaping) so select a perpendicular lineA
      if (polygonA[prevPointIndex][1] == closestPoint[1]){
        // prev point on PolygonA is horizontally offset
        lineA = [polygonA[nextPointIndex], polygonA[closestPointIndex]];
      } else if (polygonA[nextPointIndex][1] == closestPoint[1]) {
        // next point is horizontally offset
        lineA = [polygonA[prevPointIndex], polygonA[closestPointIndex]];
      }
      if(lineA[0][1] > lineA[1][1]){
        lineA = [lineA[1], lineA[0]];
      }
    }

  } else if(closestLine[0][1] == closestLine[1][1]){
    // closestLine is Horizontal

    lineDirection = 'h';
    // reorder points in line
    if(closestLine[0][0] > closestLine[1][0]){
      closestLine = [closestLine[1], closestLine[0]]
    }
    // find closest point on line
    if(Math.abs(closestPoint[0] - closestLine[0][0]) < Math.abs(closestPoint[0] - closestLine[1][0]) ){
      closestPointB = closestLine[0];
    } else {
      closestPointB = closestLine[1];
    }
    // find if lines overlap in X pixels
    if(closestPoint[0] >= closestLine[0][0] && closestPoint[0] <= closestLine[1][0]){
      overlap = true;
      // find the parallel line on polygonA
      if (polygonA[prevPointIndex][1] == closestPoint[1]){
        // prev point on PolygonA is horizontally offset
        lineA = [polygonA[prevPointIndex], polygonA[closestPointIndex]];
      } else if (polygonA[nextPointIndex][1] == closestPoint[1]) {
        // next point is horizontally offset
        lineA = [polygonA[nextPointIndex], polygonA[closestPointIndex]];
      }
      if(lineA[0][0] > lineA[1][0]){
        lineA = [lineA[1], lineA[0]];
      }
    } else {
      // nearest line is orthoganol (non overlaping) so select a perpendicular lineA
      if (polygonA[prevPointIndex][1] == closestPoint[1]){
        // prev point on PolygonA is horizontally offset
        lineA = [polygonA[nextPointIndex], polygonA[closestPointIndex]];
      } else if (polygonA[nextPointIndex][1] == closestPoint[1]) {
        // next point is horizontally offset
        lineA = [polygonA[prevPointIndex], polygonA[closestPointIndex]];
      }
      if(lineA[0][1] > lineA[1][1]){
        lineA = [lineA[1], lineA[0]];
      }
    }
  }

  return ({ delta: closestDelta,
            pointA: closestPoint,
            pointB: closestPointB,
            lineA: lineA,
            lineB: closestLine,
            overlap: overlap});
}

// finds shortest distance between point and line
function pDistance(x, y, x1, y1, x2, y2) {
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}



function cleanPolygon(polygon) {
  // clean up redundant points on a line
  let polygonLength = 0;

  while(polygon.length != polygonLength && polygon.length > 2) {

    polygonLength = polygon.length;
    for (let i=0; i<polygon.length; i++) {
      var x2i = i+1;
      if (x2i > polygon.length-1) x2i = (x2i - polygon.length);
      var x3i = i+2;
      if (x3i > polygon.length-1) x3i = (x3i - polygon.length);
      //console.log('is ', hull.length, i, x2i, x3i );
      if (polygon[i][0] == polygon[x2i][0] && polygon[i][0] == polygon[x3i][0]) {
        //console.log('remove: ', hull[i-2].x, hull[i-1].x, hull[i].x );
        polygon.splice(x2i, 1);
      }
    }
    for (let i=0; i < polygon.length; i++) {
      var y2i = i+1;
      if (y2i > polygon.length-1) y2i = (y2i - polygon.length);
      var y3i = i+2;
      if (y3i > polygon.length-1) y3i = (y3i - polygon.length);
      if (polygon[i][1] == polygon[y2i][1] && polygon[i][1] == polygon[y3i][1]) {
        //console.log('remove: ', hull[i-2].x, hull[i-1].x, hull[i].x );
        polygon.splice(y2i, 1);
      }
    }

  }
  return polygon;
}



function findNearestRect(rectA, rects) {

  let neighbors = rects.forEach((rectB) => {
    // make sure rects are not intersecting
    if (rectA !== rectB && !isIntersecting(rectA, rectB)) {
      // find closest faces
      let minDist = Number.POSITIVE_INFINITY;
    }
  });
}

// determine if two rects intersect
function isIntersecting(rectA, rectB) {
  let overlappingX = false;
  let overlappingY = false;

  if (rectA.x1 == rectB.x1 && rectA.x2 == rectB.x2 &&
     rectA.y1 == rectB.y1 && rectA.y2 == rectB.y2) {
      //same
      return true;
    }
  if (rectA.x1 >= rectB.x1 && rectA.x1 <= rectB.x2) {
    overlappingX = true;
  } else if (rectA.x2 >= rectB.x1 && rectA.x2 <= rectB.x2) {
    overlappingX = true;
  }
  if (rectA.y1 >= rectB.y1 && rectA.y1 <= rectB.y2) {
    overlappingY = true;
  } else if (rectA.y2 >= rectB.y1 && rectA.y2 <= rectB.y2) {
    overlappingY = true;
  }
  //console.log(' - result x y: ' , overlappingX, overlappingY);
  if (overlappingY && overlappingX) {
    //console.log('overlapping: ', JSON.stringify(rectA), JSON.stringify(rectB));
    return true;
  } else {
    return false;
  }
}

function findIntersecting(rects) {
  let overlappingX = false;
  let overlappingY = false;

  let overlappingRects = rects.filter((rectA, i, rects) =>
  {
    //console.log('rectPoints ', JSON.stringify(rectPoints));
    for (let rectB of rects) {
      overlappingX = false;
      overlappingY = false;
      // debugger;
      //console.log('checking: ' , JSON.stringify(rectA), JSON.stringify(rectB));
      if (!(rectA.x1 === rectB.x1 && rectA.x2 === rectB.x2 &&
         rectA.y1 === rectB.y1 && rectA.y2 === rectB.y2)) {
        if (rectA.x1 >= rectB.x1 && rectA.x1 <= rectB.x2) {
          overlappingX = true;
        } else if (rectA.x2 >= rectB.x1 && rectA.x2 <= rectB.x2) {
          overlappingX = true;
        }
        if (rectA.y1 >= rectB.y1 && rectA.y1 <= rectB.y2) {
          overlappingY = true;
        } else if (rectA.y2 >= rectB.y1 && rectA.y2 <= rectB.y2) {
          overlappingY = true;
        }
        //console.log(' - result x y: ' , overlappingX, overlappingY);
        if (overlappingY && overlappingX) {
          //console.log('overlapping: ', JSON.stringify(rectA), JSON.stringify(rectB));
          return true;
        }
      }
    }
    return false;
  });
  return(overlappingRects);
}
