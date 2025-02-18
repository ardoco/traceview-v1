import { TraceabilityLink } from "../classes";

export class MediationTraceabilityLink extends TraceabilityLink {
  sourceVisIndex: number;
  targetVisIndex: number;

  constructor(
    source: string,
    target: string,
    sourceVisIndex: number,
    targetVisIndex: number,
  ) {
    super(source, target);
    this.sourceVisIndex = sourceVisIndex;
    this.targetVisIndex = targetVisIndex;
  }

  reversed(): MediationTraceabilityLink {
    return new MediationTraceabilityLink(
      this.target,
      this.source,
      this.targetVisIndex,
      this.sourceVisIndex,
    );
  }
}
