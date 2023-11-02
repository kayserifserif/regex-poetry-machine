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

  // const p2 = PATTERN_TEMPLATE.cloneNode(true);
  // p2.innerHTML = makePatternBySharedBeginning(strings);
  // document.body.appendChild(p2);

  // const p3 = PATTERN_TEMPLATE.cloneNode(true);
  // p3.innerHTML = makePatternBySharedEnding(strings);
  // document.body.appendChild(p3);

  const p4 = PATTERN_TEMPLATE.cloneNode(true);
  p4.innerHTML = makePatternBySharedBeginningAndEnd(strings);
  document.body.appendChild(p4)
});

function makePatternByChoice(strings) {
  // just smash them together: (make|take)
  const pattern = `(${strings.join("|")})`;
  return pattern;
}

// function makePatternBySharedBeginning(strings) {
//   const sharedBeginning = getSharedBeginning(strings);
//   const remainingStrings = strings.map(str => str.slice(sharedBeginning.length));
//   const differsByOneCharacter = remainingStrings.every(str => str.length === 1);
//   if (differsByOneCharacter) {
//     // se[ea]
//     const pattern = `${sharedBeginning}[${remainingStrings.join("")}]`;
//     return pattern;
//   } else {
//     const nonEmpty = remainingStrings.filter(str => str !== "");
//     const oneExtraCharacter = nonEmpty.length === 1;

//     if (oneExtraCharacter) {
//       // hate?
//       const pattern = `${sharedBeginning}${nonEmpty[0]}?`;
//       return pattern;
//     } else {
//       // default
//       const pattern = `${sharedBeginning}(${remainingStrings.join("|")})`;
//       return pattern;
//     }
//   }
// }

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

// function makePatternBySharedEnding(strings) {
//   const sharedEnding = getSharedEnding(strings);
//   const remainingStrings = strings.map(str => str.slice(0, str.length - sharedEnding.length));
//   const differsByOneCharacter = remainingStrings.every(str => str.length === 1);
//   if (differsByOneCharacter) {
//     const pattern = `[${remainingStrings.join("")}]${sharedEnding}`;
//     return pattern;
//   } else {
//     const pattern = `(${remainingStrings.join("|")})${sharedEnding}`;
//     return pattern;
//   }
// }

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