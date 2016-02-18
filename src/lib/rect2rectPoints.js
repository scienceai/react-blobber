export default function rect2rectPoints(rect) {
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
