import * as R from "rambda";

type Library = Record<string, Function>;

type Result = {
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
    for (let [fnName, libFn] of Object.entries(library)) {
      const fn = new Function(
        libName,
        "return " + code.replace("x", "R." + fnName)
      );
      try {
        const result = fn(library);
        if (R.equals(result, expected)) {
          return Promise.resolve([{ library: libName, fnName, fn: libFn }]);
        }
      } catch (err) {
        // consume error
      }
    }
  }
  return Promise.resolve([]);
}
