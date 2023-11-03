import "./style.css";

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
  const label = container.querySelector("label");
  label.setAttribute("for", `string${stringNumber}`);
  label.innerHTML = `String ${stringNumber}`;
  const input = container.querySelector("input");
  input.setAttribute("name", `string${stringNumber}`);
  input.setAttribute("id", `string${stringNumber}`);
  input.value = "";
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

function makePatternByAlternation(strings, wrapInGroup=false) {
  if (strings.length === 0) return "";
  if (strings.length === 1) return strings[0];
  if (strings.length > 1 && strings.every(str => str === strings[0])) return strings[0];

  const nonEmpty = strings.filter(str => str !== "");
  const remainingOptional = nonEmpty.length === strings.length - 1;
  if (remainingOptional) {
    const pattern = `(${nonEmpty.join("|")})?`;
    return pattern;
  }
  
  // just smash them together: (make|take)
  if (wrapInGroup) {
    const pattern = `(${strings.join("|")})`;
    return pattern;
  }

  // no outer parentheses: make|take
  const pattern = strings.join("|");
  return pattern;
}

function makePatternBySharedBeginning(strings, preferBrackets=true) {
  if (strings.length === 0) return "";
  if (strings.length === 1) return strings[0];
  if (strings.length > 1 && strings.every(str => str === strings[0])) return strings[0];

  const sharedBeginning = getSharedBeginning(strings);
  const remainingStrings = strings.map(str => surrogateSlice(str, sharedBeginning.length));

  const differsByOneCharacter = remainingStrings.every(str => str.length === 1);
  if (differsByOneCharacter) {
    // se[ea]
    if (preferBrackets) {
      const pattern = sharedBeginning + `[${remainingStrings.join("")}]`;
      return pattern;
    }

    const pattern = sharedBeginning + `(${remainingStrings.join("|")})`;
    return pattern;
  }

  const nonEmpty = remainingStrings.filter(str => str !== "");
  const oneIsSubsetOfOther = nonEmpty.length === 1;

  if (oneIsSubsetOfOther) {
    const oneExtraCharacter = Array.from(nonEmpty[0]).length === 1;

    if (oneExtraCharacter) {
      // hate?
      const pattern = sharedBeginning + `${nonEmpty[0]}?`;
      return pattern;
    }

    const pattern = sharedBeginning + `(${nonEmpty[0]})?`;
    return pattern;
  }

  // default with shared beginning
  if (sharedBeginning) {
    const remainingOptional = nonEmpty.length === remainingStrings.length - 1;
    if (remainingOptional) {
      const pattern = sharedBeginning + `(${nonEmpty.join("|")})?`;
      return pattern;
    }

    const pattern = sharedBeginning + `(${remainingStrings.join("|")})`;
    return pattern;
  }

  // default to alteration
  const pattern = makePatternByAlternation(strings);
  return pattern;
}

function getSharedBeginning(strings) {
  const sorted = strings.toSorted((a, b) => a.length - b.length);

  let shared = "";
  const chars = Array.from(sorted[0]);
  for (let charIndex = 0; charIndex < chars.length; charIndex++) {
    const char = chars[charIndex];
    for (let strIndex = 1; strIndex < sorted.length; strIndex++) {
      const otherChars = Array.from(sorted[strIndex]);
      const otherChar = otherChars[charIndex];
      if (otherChar === undefined) continue;
      if (char !== otherChar) {
        return shared;
      }
    }
    shared += char;
  }
  return shared;
}

function makePatternBySharedEnding(strings, preferBrackets=true) {
  if (strings.length === 0) return "";
  if (strings.length === 1) return strings[0];
  if (strings.length > 1 && strings.every(str => str === strings[0])) return strings[0];

  const sharedEnding = getSharedEnding(strings);
  const remainingStrings = strings.map(str => surrogateSlice(str, 0, str.length - sharedEnding.length));

  const differsByOneCharacter = remainingStrings.every(str => str.length === 1);
  if (differsByOneCharacter) {
    // brackets
    if (preferBrackets) {
      const pattern = `[${remainingStrings.join("")}]` + sharedEnding;
      return pattern;
    }

    // parentheses ()
    const pattern = `(${remainingStrings.join("|")})` + sharedEnding;
    return pattern;
  }

  // a remainder has 0 characters, or they differ by more than 1 character
  const nonEmpty = remainingStrings.filter(str => str !== "");
  const oneIsSubsetOfOther = nonEmpty.length === 1;

  if (oneIsSubsetOfOther) {
    const oneExtraCharacter = Array.from(nonEmpty[0]).length === 1;

    if (oneExtraCharacter) {
      // a?live
      const pattern = `${nonEmpty[0]}?` + sharedEnding;
      return pattern;
    }

    // (beg)?in
    const pattern = `(${nonEmpty[0]})` + sharedEnding;
    return pattern;
  }

  // default with shared ending
  if (sharedEnding) {
    const pattern = `(${remainingStrings.join("|")})` + sharedEnding;
    return pattern;
  }

  // default to alteration
  const pattern = makePatternByAlternation(remainingStrings);
  return pattern;
}

function getSharedEnding(strings) {
  const sorted = strings.toSorted((a, b) => a.length - b.length);

  let shared = "";
  const chars = Array.from(sorted[0]);
  for (let charIndex = 0; charIndex < chars.length; charIndex++) {
    const char = chars[chars.length - 1 - charIndex];
    for (let strIndex = 1; strIndex < sorted.length; strIndex++) {
      const otherChars = Array.from(sorted[strIndex]);
      const otherChar = otherChars[otherChars.length - 1 - charIndex];
      if (otherChar === undefined) continue;
      if (char !== otherChar) {
        return shared;
      }
    }
    shared = char + shared;
  }
  return shared;
}

function makePatternBySharedBeginningAndEnd(strings, preferBrackets=true, wrapInGroup=false) {
  if (strings.length === 0) return "";
  if (strings.length === 1) return strings[0];
  if (strings.length > 1 && strings.every(str => str === strings[0])) return strings[0];

  const sharedBeginning = getSharedBeginning(strings);
  const sharedEnding = getSharedEnding(strings);
  const remainingStrings = strings.map(str => surrogateSlice(str, sharedBeginning.length, str.length - sharedEnding.length));

  // every remainder has one character - can use [] bracket expression
  const differsByOneCharacter = remainingStrings.every(str => str.length === 1);
  if (differsByOneCharacter) {
    if (preferBrackets) {
      // be[an]d
      const pattern = sharedBeginning + `[${remainingStrings.join("")}]` + sharedEnding;
      return pattern;
    }

    const pattern = sharedBeginning + `(${remainingStrings.join("|")})` + sharedEnding;
    return pattern;
  }

  // a remainder has 0 characters, or they differ by more than 1 character
  const nonEmpty = remainingStrings.filter(str => str !== "");
  const oneIsSubsetOfOther = nonEmpty.length === 1;

  if (oneIsSubsetOfOther) {
    const oneExtraCharacter = nonEmpty[0].length === 1;

    if (oneExtraCharacter) {
      // sl?eep
      const pattern = sharedBeginning + `${nonEmpty[0]}?` + sharedEnding;
      return pattern;
    }

    // (aaa)?apple
    const pattern = sharedBeginning + `(${nonEmpty[0]})?` + sharedEnding;
    return pattern;
  }

  // default with shared beginning and ending
  if (sharedBeginning || sharedEnding) {
    const remainingOptional = nonEmpty.length === remainingStrings.length - 1;
    if (remainingOptional) {
      const pattern = sharedBeginning + `(${nonEmpty.join("|")})?` + sharedEnding;
      return pattern;
    }

    const pattern = sharedBeginning + `(${remainingStrings.join("|")})` + sharedEnding;
    return pattern;
  }

  // default to alternation
  const pattern = makePatternByAlternation(strings, wrapInGroup);
  return pattern;
}

function makePatternBySharedMiddle(strings, preferBrackets=true) {
  if (strings.length === 0) return "";
  if (strings.length === 1) return strings[0];
  if (strings.length > 1 && strings.every(str => str === strings[0])) return strings[0];

  const sharedMiddle = getSharedMiddle(strings);
  if (!sharedMiddle) {
    const pattern = makePatternByAlternation(strings);
    return pattern;
  }

  const remainingStrings = strings.map(str => str.split(sharedMiddle));
  const starts = Array.from(new Set(remainingStrings.map(([start,]) => start)));
  const ends = Array.from(new Set(remainingStrings.map(([, end]) => end)));

  let startPattern = "";
  if (starts.filter(str => str !== "").length > 0) {
    startPattern = makePatternBySharedBeginningAndEnd(starts, preferBrackets, true);
  }
  let endPattern = "";
  if (ends.filter(str => str !== "").length > 0) {
    endPattern = makePatternBySharedBeginningAndEnd(ends, preferBrackets, true);
  }

  const pattern = startPattern + sharedMiddle + endPattern;
  return pattern;
}

function getSharedMiddle(strings) {
  const sorted = strings.toSorted((a, b) => a.length - b.length);

  const chars = Array.from(sorted[0]);
  for (let len = chars.length; len > 0; len--) {
    for (let startIndex = 0; startIndex <= chars.length - len; startIndex++) {
      const searchString = surrogateSlice(sorted[0], startIndex, startIndex + len);
      let found = true;
      for (let strIndex = 1; strIndex < sorted.length; strIndex++) {
        const index = sorted[strIndex].indexOf(searchString);
        if (index === -1) {
          found = false;
        }
      }
      if (found) {
        return searchString;
      }
    }
  }

  // no shared middle
  return "";
}

/* surrogate-aware slice
  https://javascript.info/iterable */
function surrogateSlice(str, start, end) {
  return Array.from(str).slice(start, end).join("");
}