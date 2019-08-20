/**
 * Represents a session data bundle.
 */
export class SessionData {

    // User id
    userId: number;
    // Session id
    sessionId: number;
    // Another session data
    parameters: any;

    constructor(userId: number, sessionId: number, parameters: any) {
        this.userId = userId;
        this.sessionId = sessionId;
        this.parameters = parameters;
    }

    serialize(): string {
        return JSON.stringify(this);
    }

    toString(): string {
        return `SessionData=${this.serialize()}`;
    }

}
