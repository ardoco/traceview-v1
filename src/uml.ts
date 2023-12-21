import { IIdentifiable } from "./classes";

export abstract class UMLBase implements IIdentifiable {
    protected identifier : string;
    protected name : string;

    getIdentifier(): string {
        return this.identifier;
    }

    constructor(identifier : string, name : string) {
        this.identifier = identifier;
        this.name = name;
    }

    public getName() {
        return this.name;
    }
}

export class UMLComponent extends UMLBase {
    protected interfaceRealizations : UMLInterfaceRealization[];
    protected usages : UMLUsage[];

    constructor(identifier : string, name : string, interfaceRealizations : UMLInterfaceRealization[], usages : UMLUsage[]) {
        super(identifier,name);
        this.identifier = identifier;
        this.interfaceRealizations = interfaceRealizations;
        this.usages = usages;
    }

    public getInterfaceRealizations() {
        return this.interfaceRealizations;
    }

    public getUsages() {
        return this.usages;
    }
}

export class UMLInterface extends UMLBase {
    public readonly operations : UMLOperation[];

    constructor(identifier : string, name : string, operations : UMLOperation[]) {
        super(identifier,name);
        this.operations = operations;
    }
}

export class UMLInterfaceRealization extends UMLBase {
    protected sourceId : string;
    protected targetId : string;

    constructor(identifier : string, sourceId : string, targetId : string,name : string) {
        super(identifier,name);
        this.sourceId = sourceId;
        this.targetId = targetId;
    }

    public getSourceId() {
        return this.sourceId;
    }

    public getTargetId() {
        return this.targetId;
    }
}

export class UMLOperation extends UMLBase {
    constructor(identifier : string, name : string) {
        super(identifier,name);
    }
}

export class UMLUsage extends UMLBase {
    public readonly sourceId : string;
    public readonly targetId : string;

    constructor(identifier : string, sourceId : string, targetId : string) {
        let name = "Usage: " + sourceId + " -> " + targetId;
        super(identifier,name);
        this.sourceId = sourceId;
        this.targetId = targetId;
    }

    public getSourceId() {
        return this.sourceId;
    }

    public getTargetId() {
        return this.targetId;
    }
}