export interface QueryExpression {
  kind: "raw";
  source: string;
}

export class DSLParser {
  parse(source: string): QueryExpression {
    return { kind: "raw", source: source.trim() };
  }
}
