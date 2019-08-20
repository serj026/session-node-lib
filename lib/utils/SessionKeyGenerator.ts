/**
 * Simple session key generator for single session mode.
 */
export class SessionKeyGenerator {
    private constructor() {}

    static generateKey(userId: number): string {
        return `_${userId}`;
    }

}
