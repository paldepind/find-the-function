import * as R from "ramda";

export type Library = Record<string, Function>;

export type Result = {
  library: string;
  fnName: string;
  fn: Function;
};

export function find<A extends Library>(
  libraries: Record<string, A>,
  code: string,
  expectedString: string
): Promise<Result[]> {
  const expected = (undefined, eval)(expectedString);
  for (let [libName, library] of Object.entries(libraries)) {
    const fn = new Function("x", libName, "return " + code);
    for (let [fnName, libFn] of Object.entries(library).reverse()) {
      try {
        const result = fn(libFn, library);
        if (R.equals(result, expected)) {
          return Promise.resolve([
            {
              library: libName,
              fnName,
              fn: libFn
            }
          ]);
        }
      } catch (err) {
        // consume error
      }
    }
  }
  return Promise.resolve([]);
}
