import React from 'react';
import rect2rectPoints from './lib/rect2rectPoints';
import orthoConvexHull from './lib/orthoConvexHull';
import roundedSVGPath from './lib/roundedSVGPath';

const Blobber = ({ rects, pathOffset, cornerRadius, containerStyle, svgStyle }) => {
  const rectsAsPoints = rects.map(rect => rect2rectPoints(rect));
  const hull = orthoConvexHull(rectsAsPoints, pathOffset);
  const roundedHullStr = roundedSVGPath(hull, cornerRadius);

  const { fill, opacity, stroke } = svgStyle || {};

  let svgPointsStr = '';
  for (let i = 0; i < hull.length; i++) {
    svgPointsStr += `${hull[i].x},${hull[i].y} `;
  }

  let svgRects = rectsAsPoints.map(({ x1, y1, x2, y2 }, idx) =>
    <rect opacity='.5' fill='grey' x={x1} y={y1} width={x2 - x1} height={y2 - y1} key={'svgrect_' + idx} />
  );

  return(
    <div
      className='blobber'
      style={containerStyle || { position:'absolute', left:'0px', top:'0px', width:'100%', height:'100%' }}
    >
      <svg width='100%' height='100%'>
        {/*svgRects*/}
        {/*<polyline fill='none' opacity='.25' stroke='blue' points={svgPointsStr}/>*/}
        <path fill={fill || 'lightgray'} opacity={opacity || '.5'} stroke={stroke || 'lightgray'} d={roundedHullStr} />
      </svg>
    </div>
  );
};

export default Blobber;
