import React from 'react';
import rect2rectPoints from './lib/rect2rectPoints';
import * as convexHullAlgos from './lib/convex-hull';
import * as polygonUnionAlgos from './lib/polygon-union';

const Blobber = ({
  rects = [],
  pathOffset = 5,
  cornerRadius = 10,
  containerStyle = { position:'absolute', left:'0px', top:'0px', width:'100%', height:'100%' },
  svgStyle = {},
  algorithm = 'convex-hull',
}) => {

  const rectsAsPoints = rects.map(rect => rect2rectPoints(rect));

  const {
    fill = 'lightgray',
    opacity = '0.5',
    stroke = 'lightgray',
  } = svgStyle;

  if (algorithm === 'convex-hull') {

    const hull = convexHullAlgos.orthoConvexHull(rectsAsPoints, pathOffset);
    const roundedHullStr = convexHullAlgos.roundedSVGPath(hull, cornerRadius);

    let svgPointsStr = '';
    for (let i = 0; i < hull.length; i++) {
      svgPointsStr += `${hull[i].x},${hull[i].y} `;
    }

    // for development
    const svgRects = rectsAsPoints.map(({ x1, y1, x2, y2 }, idx) =>
      <rect opacity='.5' fill='grey' x={x1} y={y1} width={x2 - x1} height={y2 - y1} key={'svgrect_' + idx} />
    );
    const polyline = (
      <polyline fill='none' opacity='.25' stroke='blue' points={svgPointsStr}/>
    );

    return(
      <div
        className='blobber'
        style={containerStyle}
      >
        <svg width='100%' height='100%'>
          {/*svgRects*/}
          {/*polyline*/}
          <path fill={fill} opacity={opacity} stroke={stroke} d={roundedHullStr} />
        </svg>
      </div>
    );

  } else if (algorithm === 'polygon-union') {

    const polygons = polygonUnionAlgos.makePolygonGroups(rectsAsPoints, pathOffset);

    const svgPaths = polygons.map((polygon, i) => {
      const roundedPolygon = polygonUnionAlgos.roundedSVGPath(polygon, cornerRadius);

      let svgPointsStr = '';
      polygon.forEach(point => {
        svgPointsStr += `${point[0]},${point[1]} `;
      });

      // for development
      const polygonOutline = (
        <polygon stroke='red' strokeWidth='1' fill='none' opacity='.25' points={svgPointsStr} key={'svgPoly_' + i}/>
      );
      const polygonCircle = (
        <circle cx={polygon[0][0]} cy={polygon[0][1]} r='3' fill='green'/>
      );

      return(
        <g key={'svgPolyGroup_' + i}>
          {/*polygonOutline*/}
          <path fill={fill} stroke={stroke} opacity={opacity} d={roundedPolygon} key={'svgPath_' + i}/>
          {/*polygonCircle*/}
        </g>
      );
    });

    // for development
    const svgRects = rectsAsPoints.map(({ x1, y1, x2, y2 }, idx) =>
      <rect opacity='.5' fill='gray' x={x1} y={y1} width={x2 - x1} height={y2 - y1} key={'svgrect_' + idx} />
    );
    const svgCircles = rects.map(({ x, y, width, height }, idx) =>
      <circle cx={x} cy={y} r={width / 2} key={'svgcircle_' + idx}/>
    );

    return(
      <div
        className='blobber'
        style={containerStyle}
      >
        <svg width='100%' height='100%' shapeRendering='optimizeSpeed'>
          {/*<g opacity='.25' fill='blue'>
            {svgRects}
            {svgCircles}
          </g>*/}
          {svgPaths}
        </svg>
      </div>
    );

  } else {
    throw new Error('Invalid algorithm prop');
  }

};

export default Blobber;
