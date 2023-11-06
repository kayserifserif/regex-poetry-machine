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

  const uniquePatterns = [];

  const patMiddle = makePatternBySharedMiddle(strings, preferBrackets);
  uniquePatterns.push(patMiddle)
  const patMiddleHtml = document.querySelector("#pattern--middle");
  patMiddleHtml.querySelector("dd").innerHTML = patMiddle;

  const patAlt = makePatternByAlternation(strings);
  const patAltHtml = document.querySelector("#pattern--alternation");
  if (uniquePatterns.includes(patAlt)) {
    patAltHtml.classList.add("duplicate");
  } else {
    patAltHtml.classList.remove("duplicate");
    uniquePatterns.push(patAlt);
  }
  patAltHtml.querySelector("dd").innerHTML = patAlt;

  const patBeginEnd = makePatternBySharedBeginningAndEnd(strings, preferBrackets);
  const patBeginEndHtml = document.querySelector("#pattern--begin-end");
  if (uniquePatterns.includes(patBeginEnd)) {
    patBeginEndHtml.classList.add("duplicate");
  } else {
    patBeginEndHtml.classList.remove("duplicate");
    uniquePatterns.push(patBeginEnd);
  }
  patBeginEndHtml.querySelector("dd").innerHTML = patBeginEnd;

  const patBegin = makePatternBySharedBeginning(strings, preferBrackets);
  const patBeginHtml = document.querySelector("#pattern--begin");
  console.log(patBegin, uniquePatterns)
  if (uniquePatterns.includes(patBegin)) {
    patBeginHtml.classList.add("duplicate");
  } else {
    patBeginHtml.classList.remove("duplicate");
    uniquePatterns.push(patBegin);
  }
  patBeginHtml.querySelector("dd").innerHTML = patBegin;

  const patEnd = makePatternBySharedEnding(strings, preferBrackets);
  const patEndHtml = document.querySelector("#pattern--end");
  if (uniquePatterns.includes(patEnd)) {
    patEndHtml.classList.add("duplicate");
  } else {
    patEndHtml.classList.remove("duplicate");
    uniquePatterns.push(patEnd);
  }
  patEndHtml.querySelector("dd").innerHTML = patEnd;
}