export class OptionalToken {
  operator = "?";
  operand = null;

  constructor(operand) {
    this.operand = operand;
  }

  toString() {
    return `OptionalToken(${this.operand.toString()})`;
  }
}

export class AlternationToken {
  operator = "|";
  contents = [];
  
  constructor(contents) {
    this.contents = contents;
  }

  toString() {
    return `AlternationToken(${this.contents.map(obj => obj.toString()).join(", ")})`;
  }
}

export class GroupToken {
  openParen = "(";
  closeParen = ")";
  contents = null;

  constructor(contents) {
    this.contents = contents;
  }

  toString() {
    return `GroupToken(${this.contents.map(obj => obj.toString()).join(", ")})`;
  }
}

export class BracketToken {
  openBracket = "[";
  closeBracket = "]";
  contents = null;

  constructor(contents) {
    this.contents = contents;
  }

  toString() {
    return `BracketToken(${this.contents.map(obj => obj.toString()).join(", ")})`;
  }
}

export class StringToken {
  contents = "";

  constructor(contents) {
    this.contents = contents;
  }

  toString() {
    return `StringToken(${this.contents})`;
  }
}

export class CharacterToken {
  contents = "";

  constructor(contents) {
    this.contents = contents;
  }

  toString() {
    return `CharacterToken(${this.contents})`;
  }
}