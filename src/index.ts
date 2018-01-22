import { go, combine, lift } from "@funkia/jabz";
import {
  runComponent,
  elements as e,
  modelView,
  emptyComponent
} from "@funkia/turbine";
import {
  Behavior,
  Stream,
  sample,
  scan,
  Now,
  fromFunction,
  snapshot,
  performStream,
  stepper
} from "@funkia/hareactive";
import { withEffectsP } from "@funkia/io";
import * as CodeMirror from "codemirror";
import * as R from "rambda";

import "codemirror/lib/codemirror.css";
import "codemirror/addon/edit/closebrackets";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/solarized.css";
import "codemirror/theme/material.css";

import "./main.scss";
import { find } from "./find";

const findIO = withEffectsP(find);

const codeTextarea = document.getElementById(
  "code-textarea"
) as HTMLTextAreaElement;

const myCodeMirror = CodeMirror.fromTextArea(codeTextarea, {
  lineNumbers: false,
  theme: "material",
  mode: "javascript",
  autoCloseBrackets: true
} as any);

const code = fromFunction(() => {
  return myCodeMirror.getValue();
});

const expectedTextarea = document.getElementById(
  "expected-textarea"
) as HTMLTextAreaElement;

const myExpectedCodeMirror = CodeMirror.fromTextArea(expectedTextarea, {
  lineNumbers: false,
  theme: "material",
  mode: "javascript",
  autoCloseBrackets: true
} as any);

const expectedString = fromFunction(() => {
  return myExpectedCodeMirror.getValue();
});

type ModelInput = {
  startFind: Stream<number>;
};

type ViewInput = {
  result: Behavior<string>;
};

function* findModel({ startFind }: ModelInput) {
  const startInput = lift((a, b) => [a, b], code, expectedString);
  const startFindCode = snapshot(startInput, startFind);
  const findResult = yield performStream(
    startFindCode.map(([curCode, expected]) => {
      return findIO({ R }, curCode, expected);
    })
  );
  const result = yield sample(
    stepper(
      "",
      findResult.map(results => {
        return results.length === 0 ? "" : results[0].fnName;
      })
    )
  );
  startFindCode.log();
  return { result };
}

function resultView({ fnName }) {
  return e.div([
    e.div({ class: "function-name" }, "R." + fnName),
    e.a(
      { attrs: { href: `http://ramdajs.com/docs/#${fnName}` } },
      "Go to documentation"
    )
  ]);
}

function findView({ result }: ViewInput) {
  return e.div([
    e.a({ class: "btn start-find-btn", output: { startFind: "click" } }, [
      e.i({ class: "material-icons md-24" }, "search"),
      "Find the function!"
    ]),
    result.map(fnName => {
      if (fnName === "") {
        return emptyComponent;
      } else {
        return e.div({ class: "result" }, [resultView({ fnName })]);
      }
    })
  ]);
}

const findComponent = modelView(findModel, findView as any);

const main = go(function*() {
  yield findComponent();
});

runComponent("#mount", main);
