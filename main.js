// import "./style.css";

import {
  makePatternByAlternation,
  makePatternBySharedBeginning,
  makePatternBySharedEnding,
  makePatternBySharedBeginningAndEnd,
  makePatternBySharedMiddle
} from "./stringsToRegex";

// import { test } from "./regexToStrings";
// test();

const ENTRY_TEMPLATE = document.querySelector(".saved-entry");
ENTRY_TEMPLATE.remove();

const EXAMPLE_TEMPLATE = document.querySelector(".example-entry");
EXAMPLE_TEMPLATE.remove();

const REMOVE_INPUT_TEMPLATE = document.querySelector(".remove-input-button");
REMOVE_INPUT_TEMPLATE.remove();

const examples = [
  {
    strings: ["poetry", "pottery"],
    pattern: "po(et|tte)ry",
    preferBrackets: true
  },
  {
    strings: ["bookmaking", "bookmarking"],
    pattern: "bookmar?king",
    preferBrackets: true
  },
  {
    strings: ["heart", "hope"],
    pattern: "h(eart|ope)",
    preferBrackets: true
  },
  {
    strings: ["words", "worlds"],
    pattern: "worl?ds",
    preferBrackets: true
  },
  {
    strings: ["cloud", "cling"],
    pattern: "c(loud|ing)",
    preferBrackets: true
  },
  {
    strings: ["honeydew", "drizzle"],
    pattern: "(honey)?d(ew|rizzle)",
    preferBrackets: true
  },
  {
    strings: ["heart", "hearth"],
    pattern: "hearth?",
    preferBrackets: true
  },
  {
    strings: ["💗💜💙", "💗💛💙"],
    pattern: "💗(💜|💛)💙",
    preferBrackets: true
  },
];

const examplesContainer = document.querySelector(".examples-list");
examples.forEach(example => {
  const { strings, pattern, preferBrackets } = example;

  const element = EXAMPLE_TEMPLATE.cloneNode(true);

  const stringsElement = element.querySelector(".entry-strings");
  strings.forEach(str => {
    const stringElement = document.createElement("div");
    stringElement.classList.add("saved-string");
    stringElement.textContent = str;
    stringsElement.appendChild(stringElement);
  });

  const patternElement = element.querySelector(".entry-pattern");
  patternElement.textContent = pattern;

  const loadButton = element.querySelector(".load-button");
  loadButton.addEventListener("click", () => loadPattern(pattern, strings, preferBrackets));

  examplesContainer.appendChild(element);
});

const output = document.querySelector(".output");
const patterns = output.querySelector(".patterns");
// const otherPatterns = output.querySelector(".other-patterns");

const swapButton = document.querySelector(".swap-button");
swapButton.addEventListener("click", () => {
  const inputs = Array.from(document.querySelectorAll(".string-input"));
  const vals = inputs.map(input => input.value);
  if (vals.length >= 2) {
    inputs[1].value = vals[0];
    inputs[0].value = vals[1];
  }

  if (!patterns.classList.contains("hidden")) {
    makePatterns();
  }
});

const addButton = document.querySelector(".add-button");
addButton.addEventListener("click", () => addInputContainer());

const clearInputButton = document.querySelector(".clear-input-button");
clearInputButton.addEventListener("click", clearInput);

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

  const removeButton = REMOVE_INPUT_TEMPLATE.cloneNode(true);
  container.appendChild(removeButton);
  removeButton.addEventListener("click", () => {
    container.remove();
    const inputs = document.querySelectorAll(".string-input-container");
    submit.innerHTML = (inputs.length > 2) ? "Make a match set" : "Make a match pair";
    swapButton.classList.toggle("hidden", inputs.length !== 2);
  });

  inputs[inputs.length - 1].insertAdjacentElement("afterend", container);

  swapButton.classList.toggle("hidden", inputs.length + 1 !== 2);

  return container;
}

function clearInput() {
  const inputs = document.querySelectorAll(".string-input");
  inputs.forEach(input => input.value = "");
  patterns.classList.add("hidden");
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

const copyButton = document.querySelector(".copy-button");
copyButton.addEventListener("click", copyAll);

const clearSavedButton = document.querySelector(".clear-saved-button");
clearSavedButton.addEventListener("click", clearAll);

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
  const dd = patMiddleHtml.querySelector("dd");
  dd.innerHTML = patMiddle;
  if (patMiddle.length > 15) {
    dd.style.fontSize = `${ patMiddle.length / 12 }rem`;
  } else {
    dd.style.removeProperty("font-size");
  }

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

  // if (mainPattern) {
  //   const allPatterns = document.querySelectorAll(".pattern");
  //   if (mainPattern === patMiddle) {
  //     allPatterns.forEach(p => p.classList.remove("primary"));
  //     patMiddleHtml.classList.add("primary");
  //   }
  // }
}

function savePattern(pattern, strings, preferBrackets) {
  const saved = document.querySelector(".saved");
  saved.classList.remove("hidden");
  const savedContainer = saved.querySelector(".saved-list");

  const entry = ENTRY_TEMPLATE.cloneNode(true);
  entry.setAttribute("data-group", preferBrackets ? "brackets" : "parentheses");
  savedContainer.appendChild(entry);

  const stringsHtml = entry.querySelector(".entry-strings");
  strings.forEach(str => {
    const stringHtml = document.createElement("div");
    stringHtml.classList.add("saved-string");
    stringHtml.innerHTML = str;
    stringsHtml.appendChild(stringHtml);
  })

  const patternHtml = entry.querySelector(".entry-pattern");
  patternHtml.innerHTML = pattern;

  const loadButton = entry.querySelector(".load-button");
  loadButton.addEventListener("click", () => loadPattern(pattern, strings, preferBrackets));

  const removeButton = entry.querySelector(".remove-entry-button");
  removeButton.addEventListener("click", () => entry.remove());
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

async function copyAll() {
  const allPatterns = Array.from(document.querySelectorAll(".entry-pattern"));
  const patternsText = allPatterns.map(el => el.textContent).join("\n");
  try {
    await navigator.clipboard.writeText(patternsText);
    console.log("Copied to clipboard:", patternsText);
  } catch (err) {
    console.error("Couldn't copy text:", err)
  }
}

function clearAll() {
  const savedContainer = document.querySelector(".saved-list");
  savedContainer.innerHTML = '';
}