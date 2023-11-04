import { AlternationToken, BracketToken, CharacterToken, GroupToken, OptionalToken, StringToken } from "./tokens";

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

// function generateStringsFromRegex(pattern) {
//   let strings = [];
//   let stringInProgress = "";
  
//   const chars = Array.from(pattern);
//   let i = 0;
//   for (; i < chars.length; i++) {
//     const char = chars[i];
//     switch (char) {
//       case "[":
//         {
//           const returnedStrings = parseBracket(pattern, i, stringInProgress);
//           returnedStrings.forEach(str => strings.push(str));
//           return strings;
//         }
//       default:
//         stringInProgress += char;
//         break;
//     }
//   }

//   if (stringInProgress) {
//     strings.push(stringInProgress);
//   }

//   return strings;
// }

// function parseBracket(pattern, startIndex, stringInProgress) {
//   // se[ea]
//   let strings = [];
//   const chars = Array.from(pattern);
//   let endIndex = chars.findIndex((c, i) => {
//     if (i <= startIndex) return false;
//     if (c === "]") return true;
//     return false;
//   });
//   if (endIndex === -1) {
//     // no end bracket
//     // endIndex = chars.length - 1;
//     // blah;
//     throw new Error(`Encountered opening bracket '[' but no matching closing bracket ']'\n
// ${pattern}
// ${' '.repeat(startIndex)}^
// at index ${startIndex}`);
//   }

//   const bracket = chars.slice(startIndex, endIndex);
//   const bracketChars = bracket.slice(1, bracket.length);
  
//   // new paths based on characters in bracket
//   bracketChars.forEach(c => {
//     const tempString = stringInProgress + c + chars.slice(endIndex + 1).join("");
//     const returnedStrings = generateStringsFromRegex(tempString);
//     returnedStrings.forEach(str => strings.push(str));
//   });
//   return strings;
// }

// console.log(generateStringsFromRegex("[mtb]ake"));
// console.log(generateStringsFromRegex("be[an]d"));
// console.log(generateStringsFromRegex("hai[lr]"));
// console.log(generateStringsFromRegex("be[ab]n[ab]"))