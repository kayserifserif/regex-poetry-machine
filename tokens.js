export class OptionalToken {
  operator = "?";
  operand = null;

  constructor(operand) {
    this.operand = operand;
  }
}

export class AlternationToken {
  operator = "|";
  contents = [];
  
  constructor(contents) {
    this.contents = contents;
  }
}

export class GroupToken {
  openParen = "(";
  closeParen = ")";
  contents = null;

  constructor(contents) {
    this.contents = contents;
  }
}

export class BracketToken {
  openBracket = "[";
  closeBracket = "]";
  contents = null;

  constructor(contents) {
    this.contents = contents;
  }
}

export class StringToken {
  contents = "";

  constructor(contents) {
    this.contents = contents;
  }
}

export class CharacterToken {
  contents = "";

  constructor(contents) {
    this.contents = contents;
  }
}