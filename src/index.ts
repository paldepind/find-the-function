import { go, combine, lift, just, nothing, Maybe } from "@funkia/jabz";
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
import * as R from "ramda";

import "codemirror/lib/codemirror.css";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/display/placeholder";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/solarized.css";
import "codemirror/theme/material.css";

import "./main.scss";
import { find, Result } from "./find";

const findIO = withEffectsP(find);

const codeTextarea = document.getElementById(
  "code-textarea"
) as HTMLTextAreaElement;

const codeMirrorOptions: any = {
  lineNumbers: false,
  theme: "material",
  mode: "javascript",
  autoCloseBrackets: true,
  extraKeys: { Tab: false }
};

function searchOverlay(query, caseInsensitive) {
  if (typeof query == "string")
    query = new RegExp(
      query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
      caseInsensitive ? "gi" : "g"
    );
  else if (!query.global)
    query = new RegExp(query.source, query.ignoreCase ? "gi" : "g");

  return {
    token: function(stream) {
      query.lastIndex = stream.pos;
      var match = query.exec(stream.string);
      if (match && match.index == stream.pos) {
        stream.pos += match[0].length || 1;
        return "searching";
      } else if (match) {
        stream.pos = match.index;
      } else {
        stream.skipToEnd();
      }
    }
  };
}

const myCodeMirror = CodeMirror.fromTextArea(codeTextarea, codeMirrorOptions);

myCodeMirror.addOverlay(searchOverlay("x", false));

const code = fromFunction(() => {
  return myCodeMirror.getValue();
});

const expectedTextarea = document.getElementById(
  "expected-textarea"
) as HTMLTextAreaElement;

const myExpectedCodeMirror = CodeMirror.fromTextArea(
  expectedTextarea,
  codeMirrorOptions
);

const expectedString = fromFunction(() => {
  return myExpectedCodeMirror.getValue();
});

type ModelInput = {
  startFind: Stream<number>;
};

type ViewInput = {
  result: Behavior<Maybe<Result[]>>;
};

function* findModel({ startFind }: ModelInput) {
  const startInput = lift((a, b) => [a, b], code, expectedString);
  const startFindCode = snapshot(startInput, startFind);
  const findResult = yield performStream(
    startFindCode.map(([curCode, expected]) => {
      return findIO({ R }, curCode, expected);
    })
  );
  const result = yield sample(stepper(nothing, findResult.map(just)));
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

type ExampleInput = {
  expression: string;
  output: string;
  finds: string;
};

function codeExample({ expression, output, finds }: ExampleInput) {
  return e.div({ class: "example" }, [
    e.code(expression),
    " and ",
    e.code(output),
    " finds the function ",
    e.code(finds)
  ]);
}

const example1 = codeExample({
  expression: "x(2, 3)",
  output: "5",
  finds: "R.add"
});

const example2 = codeExample({
  expression: "x(R.add, 0, [1, 2, 3])",
  output: "[0, 1, 3, 6]",
  finds: "R.scan"
});

const example3 = codeExample({
  expression: "R.reduce(x, 0, [1, 9, 3, 4])",
  output: "9",
  finds: "R.max"
});

const example4 = codeExample({
  expression: "x(n => n % 2 === 0, [0, 2, 3, 4, 5])",
  output: "[0, 2]",
  finds: "R.takeWhile"
});

function findView({ result }: ViewInput) {
  return e.div([
    e.button(
      {
        class: "btn start-find-btn",
        output: { startFind: "click" }
      },
      [e.i({ class: "material-icons md-24" }, "search"), "Find the function!"]
    ),
    result.map(res => {
      return res.match({
        nothing: () => [
          e.h2("Examples"),
          e.div({ class: "examples" }, [
            example1,
            example2,
            example3,
            example4
          ])
        ]
        just: aResult => {
          if (aResult.length === 0) {
            return e.div({ class: "result-error" }, ["No result found"]);
          } else {
            return e.div({ class: "result" }, [
              resultView({ fnName: aResult[0].fnName })
            ]);
          }
        }
      });
    })
  ]);
}

const findComponent = modelView(findModel, findView as any);

const main = go(function*() {
  yield findComponent();
});

runComponent("#mount", main);
