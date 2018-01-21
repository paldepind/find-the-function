import { go, combine } from "@funkia/jabz";
import { runComponent, elements, modelView } from "@funkia/turbine";
import { Behavior, Stream, sample, scan } from "@funkia/hareactive";
import * as CodeMirror from "codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/solarized.css";

const { p, div, h1, button } = elements;

type ViewInput = {
  count: Behavior<number>;
};

const myCodeMirror = CodeMirror(document.body, {
  value: "function myScript(){return 100;}\n",
  lineNumbers: true,
  theme: "solarized light",
  mode: "javascript"
});

function* counterModel({ increment, decrement }: ModelInput) {
  const count = yield sample(
    scan((n, m) => n + m, 0, combine(increment, decrement))
  );
  return { count };
}

function counterView({ count }: ViewInput) {
  return div([
    button({ output: { incrementClick: "click" } }, " + "),
    " ",
    count,
    " ",
    button({ output: { decrementClick: "click" } }, " - ")
  ]).map(({ incrementClick, decrementClick }) => ({
    increment: incrementClick.mapTo(1),
    decrement: decrementClick.mapTo(-1)
  }));
}

type ModelInput = {
  increment: Stream<number>;
  decrement: Stream<number>;
};

const counter = modelView(counterModel, counterView);

const main = go(function*() {
  yield h1("Find the function!");
  yield p("Below is a counter.");
  yield counter();
});

runComponent("#mount", main);
