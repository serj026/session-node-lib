/**
 * Invalid session error.
 */
export class InvalidSessionError extends Error {
    readonly code: number = -1;

    constructor(userId: number, sessionId: number) {
        super(`Invalid session: userId=${userId}, sessionId=${sessionId}`);
        Object.setPrototypeOf(this, InvalidSessionError.prototype);
    }

}
