import "./style.css";

const PATTERN_TEMPLATE = document.querySelector(".pattern");
PATTERN_TEMPLATE.remove();

const switchButton = document.querySelector(".switch-button");
switchButton.addEventListener("click", () => {
  const input1 = document.querySelector("#string1");
  const input2 = document.querySelector("#string2");
  const [val1, val2] = [input1.value, input2.value];
  input1.value = val2;
  input2.value = val1;
});

const inputForm = document.querySelector(".input-form");
inputForm.addEventListener("submit", e => {
  e.preventDefault();

  const strings = [inputForm.string1.value, inputForm.string2.value];
  const useBrackets = inputForm.group.value === "brackets";

  {
    const p = PATTERN_TEMPLATE.cloneNode(true);
    p.innerHTML = `${makePatternByChoice(strings)} (alternation)`;
    document.body.appendChild(p);
  }

  {
    const p = PATTERN_TEMPLATE.cloneNode(true);
    p.innerHTML = `${makePatternBySharedBeginning(strings, useBrackets)} (shared beginning)`;
    document.body.appendChild(p);
  }

  {
    const p = PATTERN_TEMPLATE.cloneNode(true);
    p.innerHTML = `${makePatternBySharedEnding(strings, useBrackets)} (shared ending)`;
    document.body.appendChild(p);
  }

  {
    const p = PATTERN_TEMPLATE.cloneNode(true);
    p.innerHTML = `${makePatternBySharedBeginningAndEnd(strings, useBrackets)} (shared beginning and ending)`;
    document.body.appendChild(p);
  }

  {
    const p = PATTERN_TEMPLATE.cloneNode(true);
    p.innerHTML = `${makePatternBySharedMiddle(strings, useBrackets)} (shared middle)`;
    document.body.appendChild(p);
  }

  document.body.appendChild(document.createElement("br"));
});

function makePatternByChoice(strings) {
  // just smash them together: (make|take)
  const pattern = `(${strings.join("|")})`;
  return pattern;
}

function makePatternBySharedBeginning(strings, useBrackets=true) {
  const sharedBeginning = getSharedBeginning(strings);
  const remainingStrings = strings.map(str => str.slice(sharedBeginning.length));

  const differsByOneCharacter = remainingStrings.every(str => str.length === 1);
  if (differsByOneCharacter) {
    // se[ea]
    if (useBrackets) {
      const pattern = sharedBeginning + `[${remainingStrings.join("")}]`;
      return pattern;
    }
    const pattern = sharedBeginning + `(${remainingStrings.join("|")})`;
    return pattern;
  }

  const nonEmpty = remainingStrings.filter(str => str !== "");
  const oneExtraCharacter = nonEmpty.length === 1;
  if (oneExtraCharacter) {
    // hate?
    const pattern = sharedBeginning + `${nonEmpty[0]}?`;
    return pattern;
  }

  // default
  const pattern = sharedBeginning + `(${remainingStrings.join("|")})`;
  return pattern;
}

function getSharedBeginning(strings) {
  let shared = "";
  for (let i = 0; i < strings[0].length; i++) {
    const char = strings[0][i];
    for (let j = 1; j < strings.length; j++) {
      if (char === strings[j][i]) {
        shared += char;
      } else {
        return shared;
      }
    }
  }
  return shared;
}

function makePatternBySharedEnding(strings, useBrackets=true) {
  const sharedEnding = getSharedEnding(strings);
  const remainingStrings = strings.map(str => str.slice(0, str.length - sharedEnding.length));

  const differsByOneCharacter = remainingStrings.every(str => str.length === 1);
  if (differsByOneCharacter) {
    // brackets
    if (useBrackets) {
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
    const oneExtraCharacter = nonEmpty[0].length === 1;

    if (oneExtraCharacter) {
      // a?live
      const pattern = `${nonEmpty[0]}?` + sharedEnding;
      return pattern;
    }

    // (beg)?in
    const pattern = `(${nonEmpty[0]})` + sharedEnding;
    return pattern;
  }

  // default
  const pattern = `(${remainingStrings.join("|")})` + sharedEnding;
  return pattern;
}

function getSharedEnding(strings) {
  let shared = "";
  // const lengths = strings.map(str => str.length);
  // const maxLength = Math.max(...lengths);
  // const longestString = strings.find(str => str.length === maxLength);

  for (let i = 0; i < strings[0].length; i++) {
    const char = strings[0][strings[0].length - 1 - i];
    for (let j = 1; j < strings.length; j++) {
      const otherChar = strings[j][strings[j].length - 1 - i];
      if (char === otherChar) {
        shared = char + shared;
      } else {
        return shared;
      }
    }
  }
  return shared;
}

function makePatternBySharedBeginningAndEnd(strings, useBrackets=true) {
  const sharedBeginning = getSharedBeginning(strings);
  const sharedEnding = getSharedEnding(strings);
  const remainingStrings = strings.map(str => str.slice(sharedBeginning.length, str.length - sharedEnding.length));

  // every remainder has one character - can use [] bracket expression
  const differsByOneCharacter = remainingStrings.every(str => str.length === 1);
  if (differsByOneCharacter) {
    if (useBrackets) {
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
    const pattern = `(${nonEmpty[0]})?` + sharedEnding;
    return pattern;
  }

  // default
  const pattern = sharedBeginning + `(${remainingStrings.join("|")})` + sharedEnding;
  return pattern;
}

function makePatternBySharedMiddle(strings, useBrackets=true) {
  const sharedMiddle = getSharedMiddle(strings);
  const remainingStrings = strings.map(str => str.split(sharedMiddle));
  const starts = remainingStrings.map(([start,]) => start);
  const ends = remainingStrings.map(([, end]) => end);

  let startPattern = "";
  if (starts.filter(str => str !== "").length > 0) {
    startPattern = makePatternBySharedBeginningAndEnd(starts, useBrackets);
  }
  let endPattern = "";
  if (ends.filter(str => str !== "").length > 0) {
    endPattern = makePatternBySharedBeginningAndEnd(ends, useBrackets);
  }

  const pattern = startPattern + sharedMiddle + endPattern;
  return pattern;
}

function getSharedMiddle(strings) {
  let lengths = strings.map(str => str.length);
  let minLength = Math.min(...lengths);
  let maxLength = Math.max(...lengths);
  const shortestString = strings.find(str => str.length === minLength);
  // findLast in case the lengths are the same
  const longestString = strings.findLast(str => str.length === maxLength);

  for (let len = shortestString.length; len > 0; len--) {
    for (let startIndex = 0; startIndex <= shortestString.length - len; startIndex++) {
      const searchString = shortestString.slice(startIndex, startIndex + len);
      const index = longestString.indexOf(searchString);
      if (index === -1) continue;
      return searchString;
    }
  }

  return "";
}