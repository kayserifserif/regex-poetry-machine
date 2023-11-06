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
const otherPatterns = output.querySelector(".other-patterns");

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
addButton.addEventListener("click", () => addInputContainer());

function addInputContainer() {
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

  return container;
}

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

const saveButtons = document.querySelectorAll(".save-button");
saveButtons.forEach(button => button.addEventListener("click", () => {
  const pattern = button.closest(".pattern").querySelector("dd").textContent;
  const strings = Array.from(document.querySelectorAll(".string-input")).map(input => input.value).filter(str => str !== "");
  const preferBrackets = inputForm.group.value === "brackets";
  savePattern(pattern, strings, preferBrackets);
}));

function makePatterns(mainPattern, _preferBrackets) {
  patterns.classList.remove("hidden");

  const inputs = Array.from(document.querySelectorAll(".string-input"));
  const strings = Array.from(new Set(inputs.map(input => input.value).filter(str => str !== "")));
  if (_preferBrackets !== undefined) {
    const radio = document.querySelector(`#group--${_preferBrackets ? "brackets" : "parentheses"}`);
    radio.checked = true;
  }
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

  if (mainPattern) {
    const allPatterns = document.querySelectorAll(".pattern");
    if (mainPattern === patMiddle) {
      allPatterns.forEach(p => p.classList.remove("primary"));
      patMiddleHtml.classList.add("primary");
    }
  }
}

function savePattern(pattern, strings, preferBrackets) {
  const saved = document.querySelector(".saved");
  saved.classList.remove("hidden");

  const entry = document.createElement("div");
  entry.classList.add("saved-entry");
  entry.setAttribute("data-group", preferBrackets ? "brackets" : "parentheses");
  saved.appendChild(entry);

  const stringsHtml = document.createElement("div");
  stringsHtml.classList.add("saved-strings");
  strings.forEach(str => {
    const stringHtml = document.createElement("div");
    stringHtml.classList.add("saved-string");
    stringHtml.innerHTML = str;
    stringsHtml.appendChild(stringHtml);
  })
  entry.appendChild(stringsHtml);

  const patternHtml = document.createElement("div");
  patternHtml.classList.add("saved-pattern");
  patternHtml.innerHTML = pattern;
  entry.appendChild(patternHtml);

  const loadButton = document.createElement("button");
  loadButton.type = "button";
  loadButton.classList.add("load-button");
  loadButton.classList.add("button--secondary")
  loadButton.innerHTML = "Load match pair";
  loadButton.addEventListener("click", () => loadPattern(pattern, strings, preferBrackets));
  entry.appendChild(loadButton);
}

function loadPattern(pattern, strings, preferBrackets) {
  // get the right number of inputs
  const inputContainers = Array.from(document.querySelectorAll(".string-input-container"));
  if (inputContainers.length < strings.length) {
    for (let i = 0; i < strings.length - inputContainers.length; i++) {
      const newInputContainer = addInputContainer();
      inputContainers.push(newInputContainer);
    }
  } else if (inputContainers.length > strings.length) {
    for (let i = inputContainers.length - 1; i > strings.length - 1; i--) {
      inputContainers[i].remove();
    }
  }

  // fill in strings
  for (let i = 0; i < inputContainers.length; i++) {
    const input = inputContainers[i].querySelector(".string-input");
    input.value = strings[i];
  }

  // go
  makePatterns(pattern, preferBrackets);
}