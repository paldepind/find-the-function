import { assert } from "chai";
import * as R from "ramda";
import { find } from "../src/find";

describe("find", () => {
  it("finds map in Ramda", async () => {
    const fns = await find({ R } as any, "x(n => n * n, [1,2,3])", "[1, 4, 9]");
    assert.strictEqual(fns[0].fn, R.map);
  });
  it("finds add in Ramda", async () => {
    const fns = await find({ R } as any, "R.reduce(x, 0, [1,2,3])", "6");
    assert.strictEqual(fns[0].fn, R.add);
  });
  it("handles extra x", async () => {
    const fns = await find({ R } as any, "x(x => x * x, [1,2,3])", "[1, 4, 9]");
    assert.strictEqual(fns[0].fn, R.map);
  });
  it("finds takeWhile", async () => {
    const fns = await find({ R } as any, "x((n) => n % 2 === 0, [0, 2, 4, 5, 6, 7])", "[0, 2, 4]");
    assert.strictEqual(fns[0].fn, (R as any).takeWhile);
  });
});
