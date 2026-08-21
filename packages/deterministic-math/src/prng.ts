const UINT32_RANGE = 4_294_967_296;

export class DeterministicPrng {
  private state: number;

  public constructor(seed: number) {
    this.state = seed >>> 0;
  }

  public nextUint32(): number {
    this.state = (Math.imul(this.state, 1_664_525) + 1_013_904_223) >>> 0;
    return this.state;
  }

  public nextFloat(): number {
    return this.nextUint32() / UINT32_RANGE;
  }
}
