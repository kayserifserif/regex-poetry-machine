import "./style.css";

import { AlternationToken, BracketToken, CharacterToken, GroupToken, OptionalToken, StringToken } from "./tokens";

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

function tokenise(pattern) {
  const tokens = [];
  const chars = Array.from(pattern);
  let currentString = "";
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    switch (char) {
      case "[":
        {
          if (currentString) {
            tokens.push(new StringToken(currentString));
            currentString = "";
          }

          const startIndex = i;
          let endIndex = chars.findIndex((c, i) => {
            if (i <= startIndex) return false;
            if (c === "]") return true;
            return false;
          });
          if (endIndex === -1) {
            // no end bracket
            throw new Error(`Encountered opening bracket '[' but no matching closing bracket ']'\n
${pattern}
${' '.repeat(startIndex)}^
at index ${startIndex}`);
          }
          const bracket = chars.slice(startIndex, endIndex + 1);
          let bracketChars = bracket.slice(1, bracket.length - 1);
          const charTokens = bracketChars.map(c => new CharacterToken(c));
          const token = new BracketToken(charTokens);
          tokens.push(token);
          i = endIndex;
        }
        break;
      case "(":
        {
          if (currentString) {
            tokens.push(new StringToken(currentString));
            currentString = "";
          }

          const startIndex = i;
          let endIndex = chars.findIndex((c, i) => {
            if (i <= startIndex) return false;
            if (c === ")") return true;
            return false;
          });
          if (endIndex === -1) {
            // no end paren
            throw new Error(`Encountered opening paren '(' but no matching closing paren ')'\n
${pattern}
${' '.repeat(startIndex)}^
at index ${startIndex}`);
          }
          const group = chars.slice(startIndex, endIndex + 1);
          let groupChars = group.slice(1, group.length - 1);
          const charTokens = tokenise(groupChars.join(""));
          const token = new GroupToken(charTokens);
          tokens.push(token);

          i = endIndex;
        }
        break;
      case "|":
        {
          if (currentString) {
            tokens.push(new StringToken(currentString));
            currentString = "";
          }

          if (tokens.length === 0) {
            throw new Error("Looking for token before alternation operator '|' but couldn't find one.");
          }
          let prevToken;
          if (tokens.length === 1) {
            prevToken = tokens[tokens.length - 1];
            tokens.splice(tokens.length - 1, 1);
          } else {
            prevToken = new GroupToken(tokens.slice());
            tokens.length = 0;
          }

          let innerTokens = [prevToken];
          const startIndex = i;
          let endIndex = chars.length - 1;
          for (let j = startIndex + 1; j < chars.length; j++) {
            const c = chars[j];
            if (c === ")") {
              endIndex = j;
              break;
            }
          }
          const remainder = chars.slice(startIndex + 1, endIndex + 1).join("");
          const nextToken = tokenise(remainder);
          innerTokens = innerTokens.concat(nextToken);
          const token = new AlternationToken(innerTokens);
          tokens.push(token);

          i = endIndex + 1;
        }
        break;
      case "?":
        {
          let prevToken;
          if (currentString) {
            const currentArr = Array.from(currentString);
            if (currentArr.length > 1) {
              const currentToken = new StringToken(currentArr.slice(0, currentArr.length - 1).join(""));
              tokens.push(currentToken);
            }
            const lastCharacter = currentArr[currentArr.length - 1];
            prevToken = new CharacterToken(lastCharacter);
            currentString = "";
          } else {
            if (tokens.length === 0) {
              throw new Error("Looking for token before optional operator '?' but couldn't find one.");
            }
            prevToken = tokens[tokens.length - 1];
            tokens.splice(tokens.length - 1, 1);
          }

          const token = new OptionalToken(prevToken);
          tokens.push(token);
        }
        break;
      default:
        currentString += char;
        break;
    }
  }

  if (currentString) {
    tokens.push(new StringToken(currentString));
    currentString = "";
  }

  return tokens;
}
// console.log(tokenise("se[ab]d"))
// console.log(tokenise("se(ab)d"))
// console.log(tokenise("se(a|b)d"))
// console.log(tokenise("mou?rning"))
// console.log(tokenise("f(l?ight|reeze)"))

function printTokens(tokens) {
  const str = tokens.map(token => token.toString());
  console.log(str);
}
// const tokens = tokenise("se[ab]d");
// const tokens = tokenise("se(ab)d");
// const tokens = tokenise("se(a|b)d");
// const tokens = tokenise("mou?rning");
const tokens = tokenise("f(l?ight|reeze)");
printTokens(tokens);

function generateStringsFromRegex(pattern) {
  let strings = [];
  let stringInProgress = "";
  
  const chars = Array.from(pattern);
  let i = 0;
  for (; i < chars.length; i++) {
    const char = chars[i];
    switch (char) {
      case "[":
        {
          const returnedStrings = parseBracket(pattern, i, stringInProgress);
          returnedStrings.forEach(str => strings.push(str));
          return strings;
        }
      default:
        stringInProgress += char;
        break;
    }
  }

  if (stringInProgress) {
    strings.push(stringInProgress);
  }

  return strings;
}

function parseBracket(pattern, startIndex, stringInProgress) {
  // se[ea]
  let strings = [];
  const chars = Array.from(pattern);
  let endIndex = chars.findIndex((c, i) => {
    if (i <= startIndex) return false;
    if (c === "]") return true;
    return false;
  });
  if (endIndex === -1) {
    // no end bracket
    // endIndex = chars.length - 1;
    // blah;
    throw new Error(`Encountered opening bracket '[' but no matching closing bracket ']'\n
${pattern}
${' '.repeat(startIndex)}^
at index ${startIndex}`);
  }

  const bracket = chars.slice(startIndex, endIndex);
  const bracketChars = bracket.slice(1, bracket.length);
  
  // new paths based on characters in bracket
  bracketChars.forEach(c => {
    const tempString = stringInProgress + c + chars.slice(endIndex + 1).join("");
    const returnedStrings = generateStringsFromRegex(tempString);
    returnedStrings.forEach(str => strings.push(str));
  });
  return strings;
}

// console.log(generateStringsFromRegex("[mtb]ake"));
// console.log(generateStringsFromRegex("be[an]d"));
// console.log(generateStringsFromRegex("hai[lr]"));
// console.log(generateStringsFromRegex("be[ab]n[ab]"))