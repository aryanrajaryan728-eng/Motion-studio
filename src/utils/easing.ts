import { BezierControlPoints, EasingType } from '../types/editor';

export const CURVE_PRESETS: Record<
  EasingType,
  { name: string; points: BezierControlPoints; description: string }
> = {
  'linear': {
    name: 'Linear',
    points: { x1: 0, y1: 0, x2: 1, y2: 1 },
    description: 'Constant speed, uniform motion',
  },
  'ease-in': {
    name: 'Ease In',
    points: { x1: 0.42, y1: 0, x2: 1, y2: 1 },
    description: 'Starts slowly and accelerates',
  },
  'ease-out': {
    name: 'Ease Out',
    points: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
    description: 'Starts fast and slows down softly',
  },
  'ease-in-out': {
    name: 'Ease In-Out',
    points: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
    description: 'Smooth organic acceleration and deceleration',
  },
  'overshoot': {
    name: 'Alight Overshoot',
    points: { x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 },
    description: 'Snappy kinetic pop that overshoots target then settles',
  },
  'bounce': {
    name: 'Elastic Bounce',
    points: { x1: 0.68, y1: -0.55, x2: 0.265, y2: 1.55 },
    description: 'Anticipates with slight pullback and vibrant bounce',
  },
  'spring': {
    name: 'Snappy Spring',
    points: { x1: 0.18, y1: 0.89, x2: 0.32, y2: 1.28 },
    description: 'High-energy modern reel transition',
  },
  'custom-bezier': {
    name: 'Custom Bezier',
    points: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
    description: 'Custom user-tuned motion curve',
  },
};

/**
 * Solve cubic bezier for a given t (0 <= t <= 1)
 */
function cubicBezierCoordinate(t: number, p1: number, p2: number): number {
  return (
    3 * (1 - t) * (1 - t) * t * p1 +
    3 * (1 - t) * t * t * p2 +
    t * t * t
  );
}

function solveBezierT(targetX: number, x1: number, x2: number, epsilon = 0.001): number {
  let lower = 0;
  let upper = 1;
  let t = targetX;

  for (let i = 0; i < 16; i++) {
    const currentX = cubicBezierCoordinate(t, x1, x2);
    if (Math.abs(currentX - targetX) < epsilon) {
      return t;
    }
    if (currentX < targetX) {
      lower = t;
    } else {
      upper = t;
    }
    t = (upper + lower) / 2;
  }
  return t;
}

export function evaluateCubicBezier(
  progress: number,
  points: BezierControlPoints
): number {
  const clampedX = Math.max(0, Math.min(1, progress));
  if (clampedX === 0) return 0;
  if (clampedX === 1) return 1;

  const t = solveBezierT(clampedX, points.x1, points.x2);
  return cubicBezierCoordinate(t, points.y1, points.y2);
}

/**
 * Evaluate easing for any predefined or custom curve
 */
export function getEasingValue(
  progress: number,
  easing: EasingType = 'ease-out',
  customPoints?: BezierControlPoints
): number {
  const points = customPoints || CURVE_PRESETS[easing]?.points || CURVE_PRESETS['ease-out'].points;
  return evaluateCubicBezier(progress, points);
}

/**
 * Generate SVG Path string for visual representation of a Bezier curve
 * within a bounding box (e.g. width x height)
 */
export function generateCurveSvgPath(
  points: BezierControlPoints,
  width: number,
  height: number,
  padding = 24
): {
  curvePath: string;
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
} {
  const usableW = width - padding * 2;
  const usableH = height - padding * 2;

  // In SVG, y=0 is top, so we invert Y
  const startX = padding;
  const startY = height - padding;
  const endX = width - padding;
  const endY = padding;

  const cp1X = startX + points.x1 * usableW;
  const cp1Y = startY - points.y1 * usableH;
  const cp2X = startX + points.x2 * usableW;
  const cp2Y = startY - points.y2 * usableH;

  const curvePath = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

  return {
    curvePath,
    p0: { x: startX, y: startY },
    p1: { x: cp1X, y: cp1Y },
    p2: { x: cp2X, y: cp2Y },
    p3: { x: endX, y: endY },
  };
}
