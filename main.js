import "./style.css";

import {
  makePatternByAlternation,
  makePatternBySharedBeginning,
  makePatternBySharedEnding,
  makePatternBySharedBeginningAndEnd,
  makePatternBySharedMiddle
} from "./stringsToRegex";

// import { test } from "./regexToStrings";
// test();

const output = document.querySelector(".output");
const patterns = output.querySelector(".patterns");

const switchButton = document.querySelector(".switch-button");
switchButton.addEventListener("click", () => {
  const inputs = Array.from(document.querySelectorAll(".string-input"));
  const vals = inputs.map(input => input.value);
  if (vals.length >= 2) {
    inputs[1].value = vals[0];
    inputs[0].value = vals[1];
  }
  makePatterns();
});

const addButton = document.querySelector(".add-button");
addButton.addEventListener("click", () => {
  const inputs = document.querySelectorAll(".string-input-container");
  const container = document.querySelector(".string-input-container").cloneNode(true);
  const stringNumber = inputs.length + 1;

  const submit = document.querySelector("button[type='submit']");
  submit.innerHTML = "Make a match set";

  const label = container.querySelector("label");
  label.setAttribute("for", `string${stringNumber}`);
  label.innerHTML = `String ${stringNumber}`;

  const input = container.querySelector("input");
  input.setAttribute("name", `string${stringNumber}`);
  input.setAttribute("id", `string${stringNumber}`);
  input.value = "";

  const button = document.createElement("button");
  container.appendChild(button);
  button.type = "button";
  button.innerHTML = "Remove";
  button.addEventListener("click", () => {
    container.remove();
    const inputs = document.querySelectorAll(".string-input-container");
    submit.innerHTML = (inputs.length > 2) ? "Make a match set" : "Make a match pair";
  });

  inputs[inputs.length - 1].insertAdjacentElement("afterend", container);
});

const groupInputs = document.querySelectorAll("input[name='group']");
groupInputs.forEach(input => input.addEventListener("input", () => {
  if (patterns.classList.contains("hidden")) return;
  makePatterns();
}))

const inputForm = document.querySelector(".input-form");
// const output = document.querySelector(".output");
inputForm.addEventListener("submit", e => {
  e.preventDefault();
  makePatterns();
});

function makePatterns() {
  patterns.classList.remove("hidden");

  const inputs = Array.from(document.querySelectorAll(".string-input"));
  const strings = Array.from(new Set(inputs.map(input => input.value).filter(str => str !== "")));
  const preferBrackets = inputForm.group.value === "brackets";

  const patAlt = makePatternByAlternation(strings);
  const patAltHtml = document.querySelector("#pattern--alternation");
  patAltHtml.querySelector("dd").innerHTML = patAlt;

  const patBegin = makePatternBySharedBeginning(strings, preferBrackets);
  const patBeginHtml = document.querySelector("#pattern--begin");
  patBeginHtml.classList.toggle("duplicate", patBegin === patAlt);
  patBeginHtml.querySelector("dd").innerHTML = patBegin;

  const patEnd = makePatternBySharedEnding(strings, preferBrackets);
  const patEndHtml = document.querySelector("#pattern--end");
  patEndHtml.classList.toggle("duplicate", patEnd === patAlt);
  patEndHtml.querySelector("dd").innerHTML = patEnd;

  const patBeginEnd = makePatternBySharedBeginningAndEnd(strings, preferBrackets);
  const patBeginEndHtml = document.querySelector("#pattern--begin-end");
  patBeginEndHtml.classList.toggle("duplicate", patBeginEnd === patAlt);
  patBeginEndHtml.querySelector("dd").innerHTML = patBeginEnd;

  const patMiddle = makePatternBySharedMiddle(strings, preferBrackets);
  const patMiddleHtml = document.querySelector("#pattern--middle");
  patMiddleHtml.classList.toggle("duplicate", patMiddle === patAlt);
  patMiddleHtml.querySelector("dd").innerHTML = patMiddle;
}