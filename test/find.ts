import { assert } from "chai";
import * as R from "rambda";
import { find } from "../src/find";

describe("find", () => {
  it("finds map in Rambda", async () => {
    const fns = await find({ R } as any, "x(n => n * n, [1,2,3])", "[1, 4, 9]");
    console.log(fns);
    assert.strictEqual(fns[0].fn, R.map);
  });
  it("finds add in Rambda", async () => {
    const fns = await find({ R } as any, "R.reduce(x, 0, [1,2,3])", "6");
    console.log(fns);
    assert.strictEqual(fns[0].fn, R.add);
  });
  it("handles extra x", async () => {
    const fns = await find({ R } as any, "x(x => x * x, [1,2,3])", "[1, 4, 9]");
    console.log(fns);
    assert.strictEqual(fns[0].fn, R.map);
  });
});
