import { go, combine } from "@funkia/jabz";
import { runComponent, elements, modelView } from "@funkia/turbine";
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
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/solarized.css";
import "codemirror/theme/material.css";

import "./main.scss";
import { find } from "./find";

const { p, div, h1, a, i } = elements;

const findIO = withEffectsP(find);

const codeTextarea = document.getElementById(
  "code-textarea"
) as HTMLTextAreaElement;

const myCodeMirror = CodeMirror.fromTextArea(codeTextarea, {
  lineNumbers: true,
  theme: "material",
  mode: "javascript"
});

const code = fromFunction(() => {
  return myCodeMirror.getValue();
});

type Result = string[];

type ModelInput = {
  startFind: Stream<number>;
};

type ViewInput = {
  result: Behavior<string>;
};

function* findModel({ startFind }: ModelInput) {
  yield Now.of(12);
  const startFindCode = snapshot(code, startFind);
  const findResult = yield performStream(
    startFindCode.map(curCode => {
      return findIO({ R }, curCode);
    })
  );
  const result = yield sample(stepper("", findResult.map(r => r.toString())));
  startFindCode.log();
  return { result };
}

function findView({ result }: ViewInput) {
  return div([
    a({ class: "btn start-find-btn", output: { startFind: "click" } }, [
      i({ class: "material-icons md-24" }, "search"),
      "Find the function!"
    ]),
    div(result)
  ]);
}

const findComponent = modelView(findModel, findView as any);

const main = go(function*() {
  yield findComponent();
});

runComponent("#mount", main);
