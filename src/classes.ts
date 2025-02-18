export interface IIdentifiable {
  getIdentifier(): string;
}

export class TraceabilityLink {
  source: string;
  target: string;

  constructor(source: string, target: string) {
    this.source = source;
    this.target = target;
  }

  reversed() {
    return new TraceabilityLink(this.target, this.source);
  }
}

export class NLSentence implements IIdentifiable {
  content: string;
  identifier: string;

  constructor(content: string, identifier: string) {
    this.content = content;
    this.identifier = identifier;
  }

  getIdentifier() {
    return this.identifier;
  }

  public getContent() {
    return this.content;
  }
}
