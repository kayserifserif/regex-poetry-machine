import "./style.css";

import {
  makePatternByAlternation,
  makePatternBySharedBeginning,
  makePatternBySharedEnding,
  makePatternBySharedBeginningAndEnd,
  makePatternBySharedMiddle
} from "./stringsToRegex";

const PATTERN_TEMPLATE = document.querySelector(".pattern");
PATTERN_TEMPLATE.remove();

const switchButton = document.querySelector(".switch-button");
switchButton.addEventListener("click", () => {
  const inputs = Array.from(document.querySelectorAll(".string-input"));
  const vals = inputs.map(input => input.value);
  if (vals.length >= 2) {
    inputs[1].value = vals[0];
    inputs[0].value = vals[1];
  }
});

const addButton = document.querySelector(".add-button");
addButton.addEventListener("click", () => {
  const inputs = document.querySelectorAll(".string-input-container");
  const container = document.querySelector(".string-input-container").cloneNode(true);
  container.classList.add("string-input-container");
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

const inputForm = document.querySelector(".input-form");
const output = document.querySelector(".output");
inputForm.addEventListener("submit", e => {
  e.preventDefault();

  output.innerHTML = "";

  const inputs = Array.from(document.querySelectorAll(".string-input"));
  const strings = Array.from(new Set(inputs.map(input => input.value).filter(str => str !== "")));
  const preferBrackets = inputForm.group.value === "brackets";

  const patternByAlternation = makePatternByAlternation(strings);
  {
    const p = PATTERN_TEMPLATE.cloneNode(true);
    p.classList.add("secondary");
    p.setAttribute("data-algorithm", "Alternation");
    p.innerHTML = patternByAlternation;
    output.appendChild(p);
  }

  const patternBySharedBeginning = makePatternBySharedBeginning(strings, preferBrackets);
  {
    const p = PATTERN_TEMPLATE.cloneNode(true);
    p.classList.add("secondary");
    p.setAttribute("data-algorithm", "Shared beginning");
    p.innerHTML = patternBySharedBeginning;
    p.classList.toggle("duplicate", patternBySharedBeginning === patternByAlternation);
    output.appendChild(p);
  }

  const patternBySharedEnding = makePatternBySharedEnding(strings, preferBrackets);
  {
    const p = PATTERN_TEMPLATE.cloneNode(true);
    p.classList.add("secondary");
    p.setAttribute("data-algorithm", "Shared ending");
    p.innerHTML = patternBySharedEnding;
    p.classList.toggle("duplicate", patternBySharedEnding === patternByAlternation);
    output.appendChild(p);
  }

  const patternBySharedBeginningAndEnd = makePatternBySharedBeginningAndEnd(strings, preferBrackets);
  {
    const p = PATTERN_TEMPLATE.cloneNode(true);
    p.classList.add("secondary");
    p.setAttribute("data-algorithm", "Shared beginning and ending");
    p.innerHTML = patternBySharedBeginningAndEnd;
    p.classList.toggle("duplicate", patternBySharedBeginningAndEnd === patternByAlternation);
    output.appendChild(p);
  }

  const patternBySharedMiddle = makePatternBySharedMiddle(strings, preferBrackets);
  {
    const p = PATTERN_TEMPLATE.cloneNode(true);
    p.classList.add("primary");
    p.setAttribute("data-algorithm", "Shared middle");
    p.innerHTML = patternBySharedMiddle;
    p.classList.toggle("duplicate", patternBySharedMiddle === patternByAlternation);
    output.appendChild(p);
  }

  document.body.appendChild(document.createElement("br"));
});