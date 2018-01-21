import { go, combine } from "@funkia/jabz";
import { runComponent, elements, modelView } from "@funkia/turbine";
import { Behavior, Stream, sample, scan } from "@funkia/hareactive";
import * as CodeMirror from "codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/solarized.css";
import "codemirror/theme/material.css";

import "./main.scss";

const { p, div, h1, a } = elements;

const codeTextarea = document.getElementById(
  "code-textarea"
) as HTMLTextAreaElement;

const myCodeMirror = CodeMirror.fromTextArea(codeTextarea, {
  value: "function myScript(){return 100;}\n",
  lineNumbers: true,
  theme: "material",
  mode: "javascript"
});

type ModelInput = {
  startFind: Stream<number>;
};

type ViewInput = {
  count: Behavior<number>;
};

function* findModel({ startFind }: ModelInput) {
  yield Behavior.of(12);
  const count = startFind;
  return { count };
}

function findView({ count }: ViewInput) {
  return div([
    a(
      { class: "btn start-find-btn", output: { startFind: "click" } },
      "Find the function!"
    )
  ]);
}

const findComponent = modelView(findModel, findView as any);

const main = go(function*() {
  yield findComponent();
});

runComponent("#mount", main);
