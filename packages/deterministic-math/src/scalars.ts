const TWO_PI = Math.PI * 2;

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

export function wrapRadians(radians: number): number {
  return ((((radians + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

export function smoothstep(lowerEdge: number, upperEdge: number, value: number): number {
  if (lowerEdge >= upperEdge) {
    throw new RangeError('smoothstep requires lowerEdge < upperEdge');
  }

  const amount = clamp((value - lowerEdge) / (upperEdge - lowerEdge), 0, 1);
  return amount * amount * (3 - 2 * amount);
}
