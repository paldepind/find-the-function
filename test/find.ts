import { assert } from "chai";
import * as R from "rambda";
import { find } from "../src/find";

describe("find", () => {
  it("finds map in Rambda", async () => {
    assert.strictEqual(1, 1);
    const fns = await find({ R } as any, "x(n => n * n, [1,2,3])", "[1, 4, 9]");
    console.log(fns);
    assert.isTrue(fns.includes(R.map));
  });
  it("finds add in Rambda", async () => {
    assert.strictEqual(1, 1);
    const fns = await find({ R } as any, "R.reduce(x, 0, [1,2,3])", "6");
    console.log(fns);
    assert.isTrue(fns.includes(R.add));
  });
});
