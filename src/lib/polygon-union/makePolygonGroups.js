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
  let bridgeData = findNearestPoints(polygonsArr[0], polygonsArr[1]);
  console.log('test findNearestPoints', bridgeData);

  let bridgeRect;
  if(bridgeData.overlap == true){
    if (bridgeData.lineDirection == 'h'){
      // find the overlapping x pixels
      let rectX1 = bridgeData.lineA[0][0] > bridgeData.lineB[0][0] ? bridgeData.lineA[0][0] : bridgeData.lineB[0][0];
      let rectX2 = bridgeData.lineA[1][0] < bridgeData.lineB[1][0] ? bridgeData.lineA[1][0] : bridgeData.lineB[1][0];
      let rectY1 = bridgeData.lineA[0][1];
      let rectY2 = bridgeData.lineB[0][1];

      let deltaX = Math.abs(rectX2 - rectX1);
      let deltaY = Math.abs(rectY2 - rectY1);
      let thickness = minBridgeThickness;

      if(style == 'elastic'){
        thickness = deltaX * ((1/(deltaY*deltaY))*200);
        if(thickness < minBridgeThickness) thickness = minBridgeThickness;
      }
      let bridgeX1 = ((rectX2 - rectX1)/2) - (thickness/2) + rectX1;
      let bridgeX2 = ((rectX2 - rectX1)/2) + (thickness/2) + rectX1;

      bridgeX1 = bridgeX1 < rectX1 ? rectX1 : bridgeX1;
      bridgeX2 = bridgeX2 > rectX2 ? rectX2 : bridgeX2;

      bridgeRect =  [[bridgeX1, rectY1], [bridgeX2, rectY1], [bridgeX2, rectY2], [bridgeX1, rectY2]];
      //console.log('bridgeRect ', bridgeRect);
      polygonsArr = polygonBoolean(polygonsArr, bridgeRect, 'or');

    } else {
      // lineDirection == 'v' - find the overlapping Y pixels
      let rectY1 = bridgeData.lineA[0][1] > bridgeData.lineB[0][1] ? bridgeData.lineA[0][1] : bridgeData.lineB[0][1];
      let rectY2 = bridgeData.lineA[1][1] < bridgeData.lineB[1][1] ? bridgeData.lineA[1][1] : bridgeData.lineB[1][1];
      let rectX1 = bridgeData.lineA[0][0];
      let rectX2 = bridgeData.lineB[0][0];

      let deltaX = Math.abs(rectX2 - rectX1);
      let deltaY = Math.abs(rectY2 - rectY1);
      let thickness = minBridgeThickness;

      if(style == 'elastic'){
        thickness = deltaY * ((1/(deltaX*deltaX))*200);
        if(thickness < minBridgeThickness) thickness = minBridgeThickness;
      }
      let bridgeY1 = ((rectY2 - rectY1)/2) - (thickness/2) + rectY1;
      let bridgeY2 = ((rectY2 - rectY1)/2) + (thickness/2) + rectY1;
      bridgeY1 = bridgeY1 < rectY1 ? rectY1 : bridgeY1;
      bridgeY2 = bridgeY2 > rectY2 ? rectY2 : bridgeY2;

      bridgeRect =  [[rectX1, bridgeY1], [rectX2, bridgeY1], [rectX2, bridgeY2], [rectX1, bridgeY2]];
      console.log('bridgeRect ', bridgeRect);
      polygonsArr = polygonBoolean(polygonsArr, bridgeRect, 'or');

    }
  }

  // console.log('bridgePoints result data', bridgeRect);

  //console.log('joinPolygons result data', JSON.stringify(polygonsArr));
  return(polygonsArr);
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
    let thisclosestPointIndex;

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
        thisclosestPointIndex = indexA;

        // TODO - check for best fit on closest line when points are alligned
        // if points allign vertically the line should be horizontal

        let thisNextPointI = i+1 < arr.length ? i+1 : 0;
        let thisPrevPointI = i-1 >= 0 ? i-1 : arr.length-1;

        thisClosestLine = [arr[i], arr[thisNextPointI]];

        console.log('compare: ', thisClosestPoint[1], arr[i][1], arr[thisNextPointI][1]);
        if((thisClosestPoint[0] == arr[i][0]) && (thisClosestPoint[0] == arr[thisNextPointI][0])){
          // all x's are same- aligned on Y axis
          thisClosestLine = [arr[i], arr[thisPrevPointI]];
          console.log('swapping vertical line');
        } else if ((thisClosestPoint[1] == arr[i][1]) && (thisClosestPoint[1] == arr[thisNextPointI][1])){
          // all Y's are same- aligned on X axis
          thisClosestLine = [arr[i], arr[thisPrevPointI]];
          console.log('swapping H line');
        }

        // if (i < arr.length-1){
        //   thisClosestLine = [arr[i], arr[i+1]];
        // } else {
        //   thisClosestLine = [arr[i], arr[0]];
        // }
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
      closestPointIndex = thisclosestPointIndex;
    }

    // polygonB.forEach(pointB =>{
    //   let xDelta = (pointA[0] - pointB[0]);
    //   let yDelta = (pointA[0] - pointB[0]);
    //   let delta = Math.sqrt(Math.abs(xDelta * xDelta) + Math.abs(yDelta * yDelta));
    //   // let delta = pDistance()
    //   if (delta < closestDelta) {
    //     closestDelta = delta;
    //     closestPoints = [pointA, pointB];
    //   }
    // });

  });


  //console.log('closestDelta: ', closestDelta);
  let lineDirection = 'h';
  let closestPointB = closestLine[0][0];
  let overlap = false;
  let lineA = [[0,0],[0,10]];

  // find if points are alligned
  if(closestPoint[0] == closestLine[0][0]){
    // x coordinate is alligned
    overlap = true;
    console.log("x align");
  } else if (closestPoint[1] == closestLine[0][1]){
    // y coordinate is alligned
    overlap = true;
    console.log("y align");
  }

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
    }

    let prevPointIndex = closestPointIndex-1;
    let nextPointIndex = closestPointIndex+1;

    if (prevPointIndex < 0) prevPointIndex = polygonA.length - 1;
    if (nextPointIndex > polygonA.length-1) nextPointIndex = 0;
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
    // Manage Horizontal Lines
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
    }
    // find the parallel line on polygonA
    let prevPointIndex = closestPointIndex-1;
    let nextPointIndex = closestPointIndex+1;

    if (prevPointIndex < 0) prevPointIndex = polygonA.length - 1;
    if (nextPointIndex > polygonA.length-1) nextPointIndex = 0;
    if (polygonA[prevPointIndex][1] == closestPoint[1]){
      // prev point on PolygonA is horizontally offset
      lineA = [polygonA[prevPointIndex], polygonA[closestPointIndex]];
      // debugger;
    } else if (polygonA[nextPointIndex][1] == closestPoint[1]) {
      // next point is horizontally offset
      lineA = [polygonA[nextPointIndex], polygonA[closestPointIndex]];
      // debugger;
    }
    if(lineA[0][0] > lineA[1][0]){
      lineA = [lineA[1], lineA[0]]
    }
  }

  return ({ delta: closestDelta,
            pointA: closestPoint,
            pointB: closestPointB,
            lineA: lineA,
            lineB: closestLine,
            lineDirection: lineDirection,
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
