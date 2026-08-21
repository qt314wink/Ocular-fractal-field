import { clamp } from './scalars.js';

type Point = readonly [x: number, y: number];

const NEWTON_ITERATIONS = 8;
const BISECTION_ITERATIONS = 16;
const DERIVATIVE_EPSILON = 1e-7;
const SOLUTION_EPSILON = 1e-7;

export class CubicBezier {
  public constructor(
    private readonly firstControl: Point,
    private readonly secondControl: Point,
  ) {
    for (const coordinate of [...firstControl, ...secondControl]) {
      if (!Number.isFinite(coordinate)) {
        throw new TypeError('CubicBezier control points must be finite');
      }
    }

    if (
      firstControl[0] < 0 ||
      firstControl[0] > 1 ||
      secondControl[0] < 0 ||
      secondControl[0] > 1
    ) {
      throw new RangeError('CubicBezier x control points must be within [0, 1]');
    }
  }

  public solveY(inputX: number): number {
    const x = clamp(inputX, 0, 1);
    if (x === 0 || x === 1) {
      return x;
    }

    let parameter = x;
    let useBisection = false;

    for (let iteration = 0; iteration < NEWTON_ITERATIONS; iteration += 1) {
      const error = this.sampleX(parameter) - x;
      if (Math.abs(error) <= SOLUTION_EPSILON) {
        return this.sampleY(parameter);
      }

      const derivative = this.sampleXDerivative(parameter);
      if (Math.abs(derivative) < DERIVATIVE_EPSILON) {
        useBisection = true;
        break;
      }

      const candidate = parameter - error / derivative;
      if (candidate < 0 || candidate > 1) {
        useBisection = true;
        break;
      }
      parameter = candidate;
    }

    if (!useBisection) {
      return this.sampleY(clamp(parameter, 0, 1));
    }

    let lower = 0;
    let upper = 1;
    for (let iteration = 0; iteration < BISECTION_ITERATIONS; iteration += 1) {
      parameter = (lower + upper) / 2;
      if (this.sampleX(parameter) < x) {
        lower = parameter;
      } else {
        upper = parameter;
      }
    }

    return this.sampleY((lower + upper) / 2);
  }

  private sampleX(parameter: number): number {
    return sampleCoordinate(parameter, this.firstControl[0], this.secondControl[0]);
  }

  private sampleY(parameter: number): number {
    return sampleCoordinate(parameter, this.firstControl[1], this.secondControl[1]);
  }

  private sampleXDerivative(parameter: number): number {
    return sampleCoordinateDerivative(parameter, this.firstControl[0], this.secondControl[0]);
  }
}

function sampleCoordinate(parameter: number, firstControl: number, secondControl: number): number {
  const inverse = 1 - parameter;
  return (
    3 * inverse * inverse * parameter * firstControl +
    3 * inverse * parameter * parameter * secondControl +
    parameter * parameter * parameter
  );
}

function sampleCoordinateDerivative(
  parameter: number,
  firstControl: number,
  secondControl: number,
): number {
  const inverse = 1 - parameter;
  return (
    3 * inverse * inverse * firstControl +
    6 * inverse * parameter * (secondControl - firstControl) +
    3 * parameter * parameter * (1 - secondControl)
  );
}
