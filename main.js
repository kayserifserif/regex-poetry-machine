import "./style.css";

const PATTERN_TEMPLATE = document.querySelector(".pattern");
PATTERN_TEMPLATE.remove();

const inputForm = document.querySelector(".input-form");
// inputForm.addEventListener("input", () => {
inputForm.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(inputForm).entries());
  const strings = Object.values(data);

  const p1 = PATTERN_TEMPLATE.cloneNode(true);
  p1.innerHTML = makePatternByChoice(strings);
  document.body.appendChild(p1);

  const p2 = PATTERN_TEMPLATE.cloneNode(true);
  p2.innerHTML = makePatternBySharedBeginning(strings);
  document.body.appendChild(p2);

  const p3 = PATTERN_TEMPLATE.cloneNode(true);
  p3.innerHTML = makePatternBySharedEnding(strings);
  document.body.appendChild(p3);

  const p4 = PATTERN_TEMPLATE.cloneNode(true);
  p4.innerHTML = makePatternBySharedBeginningAndEnd(strings);
  document.body.appendChild(p4);

  const p5 = PATTERN_TEMPLATE.cloneNode(true);
  p5.innerHTML = makePatternBySharedMiddle(strings);
  document.body.appendChild(p5);
});

const switchButton = document.querySelector(".switch-button");
switchButton.addEventListener("click", () => {
  const input1 = document.querySelector("#string1");
  const input2 = document.querySelector("#string2");
  const [val1, val2] = [input1.value, input2.value];
  input1.value = val2;
  input2.value = val1;
});

function makePatternByChoice(strings) {
  // just smash them together: (make|take)
  const pattern = `(${strings.join("|")})`;
  return pattern;
}

function makePatternBySharedBeginning(strings) {
  const sharedBeginning = getSharedBeginning(strings);
  const remainingStrings = strings.map(str => str.slice(sharedBeginning.length));
  const differsByOneCharacter = remainingStrings.every(str => str.length === 1);
  if (differsByOneCharacter) {
    // se[ea]
    const pattern = `${sharedBeginning}[${remainingStrings.join("")}]`;
    return pattern;
  } else {
    const nonEmpty = remainingStrings.filter(str => str !== "");
    const oneExtraCharacter = nonEmpty.length === 1;

    if (oneExtraCharacter) {
      // hate?
      const pattern = `${sharedBeginning}${nonEmpty[0]}?`;
      return pattern;
    } else {
      // default
      const pattern = `${sharedBeginning}(${remainingStrings.join("|")})`;
      return pattern;
    }
  }
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

function makePatternBySharedEnding(strings) {
  const sharedEnding = getSharedEnding(strings);
  const remainingStrings = strings.map(str => str.slice(0, str.length - sharedEnding.length));
  const differsByOneCharacter = remainingStrings.every(str => str.length === 1);
  if (differsByOneCharacter) {
    const pattern = `[${remainingStrings.join("")}]${sharedEnding}`;
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
  const pattern = `(${remainingStrings.join("|")})${sharedEnding}`;
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

function makePatternBySharedBeginningAndEnd(strings) {
  const sharedBeginning = getSharedBeginning(strings);
  const sharedEnding = getSharedEnding(strings);
  const remainingStrings = strings.map(str => str.slice(sharedBeginning.length, str.length - sharedEnding.length));

  // every remainder has one character - can use [] bracket expression
  const differsByOneCharacter = remainingStrings.every(str => str.length === 1);
  if (differsByOneCharacter) {
    // be[an]d
    const pattern = sharedBeginning + `[${remainingStrings.join("")}]` + sharedEnding;
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

function makePatternBySharedMiddle(strings) {
  const sharedMiddle = getSharedMiddle(strings);
  const remainingStrings = strings.map(str => str.split(sharedMiddle));
  const starts = remainingStrings.map(([start,]) => start);
  const ends = remainingStrings.map(([, end]) => end);

  let startPattern = "";
  if (starts.filter(str => str !== "").length > 0) {
    startPattern = makePatternBySharedBeginningAndEnd(starts);
  }
  let endPattern = "";
  if (ends.filter(str => str !== "").length > 0) {
    endPattern = makePatternBySharedBeginningAndEnd(ends);
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

  let len = shortestString.length;
  let startIndex = 0;
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