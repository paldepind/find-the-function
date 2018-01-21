type Library = Record<string, Function>;

export function find<A extends Library>(
  libraries: Record<string, A>,
  code: string
): Promise<Function[]> {
  for (let [libName, library] of Object.entries(libraries)) {
    for (let [fnName, libFn] of Object.entries(library)) {
      const fn = new Function(
        libName,
        "return " + code.replace("?", "R." + fnName)
      );
      try {
        const result = fn(library);
        if (result) {
          return Promise.resolve([libFn]);
        }
      } catch (err) {
        // consume error
      }
    }
  }
  return Promise.resolve([]);
}
