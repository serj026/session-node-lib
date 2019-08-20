/**
 * Session id encoder.
 */
export class SessionIdEncored {
    private constructor() {}

    static encode(value: number): number {
        let encodedValue: number = 0;
        while (value != 0) {
            encodedValue <<= 1;
            encodedValue |= (value & 1);
            value >>= 1;
        }
        return encodedValue;
    }
}
