import polygonBoolean from 'poly-bool';

export default function makePolygonGroups(rects, pathOffset) {
  const polygons = unionRects(offsetRects(rects, pathOffset));
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

function unionRects(rects) {
  //console.log('unionRects: ', rects);
  let initialPoly = polygonPointArr(rects[0]);
  let polygon = [initialPoly];// todo - don't init?
  //console.log(' - polygon:', polygon);
  rects.forEach((rect, i) => {
    //console.log(' - rect:', rect);
    let pointArr = polygonPointArr(rect);
    //console.log(' - pointArr:', pointArr);
    polygon = polygonBoolean([pointArr], polygon, 'or');
    //console.log(' - polygon:', polygon);

  });
  //console.log(' - unionRects returning: ', polygon);
  return polygon;
}

function polygonPointArr(rect) {
  const { x1, y1, x2, y2 } = rect;
  return [ [x1, y1], [x2, y1], [x2, y2], [x1, y2] ];
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

function findNearestRect(rectA, rects) {

  let neighbors = rects.forEach((rectB) => {
    // make sure rects are not intersecting
    if (rectA !== rectB && !isIntersecting(rectA, rectB)) {
      // find closest faces
      let minDist = Number.POSITIVE_INFINITY;
    }
  });
}

function findNearestPoints(polygonA, polygonB) {
  let closestDelta = Number.POSITIVE_INFINITY;

  polygonA.forEach(pointA => {
    let thisClosestDelta = polygonB.reduce( (prev, curr, i, arr) => {
      let minDistance = 0;
      if (i < arr.length -1) {
        minDistance = pDistance(pointA[0], pointA[1], arr[i][0], arr[i][1], arr[i+1][0], arr[i+1][1]);
      } else {
        minDistance = pDistance(pointA[0], pointA[1], arr[i][0], arr[i][1], arr[0][0], arr[0][1]);
      }
      //console.log('minDistance ', minDistance);
      if (minDistance < prev) {
        return minDistance;
      } else {
        return prev;
      }
    }, Number.POSITIVE_INFINITY);

    //console.log('thisClosestDelta ', thisClosestDelta);
    if (thisClosestDelta < closestDelta) closestDelta = thisClosestDelta;

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
  return closestDelta;
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
