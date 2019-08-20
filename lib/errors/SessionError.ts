/**
 * Session library error.
 */
export class SessionError extends Error {
    code: number;

    constructor(message: string, code: number = -1) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, SessionError.prototype);
    }

}
