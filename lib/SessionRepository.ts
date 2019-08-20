import { SessionData } from "./SessionData";
import { RedisClient } from "redis";
import { SessionError } from "./errors/SessionError";
import { SessionKeyGenerator } from "./utils/SessionKeyGenerator";

const DEFAULT_SESSION_EXPIRATION = 15;
const DEFAULT_REDIS_INCR_VALUE = 1;
const INCR_DELTA = 1;
const SESSION_ID_KEY = "SESSION_ID";
const SESSION_KEY_REGEXP = "_[0-9]*";

/**
 * Session repository.
 */
export interface SessionRepository {

    /**
     * Saves the session data.
     * 
     * @param sessionData Session data
     */
    saveSessionData(sessionData: SessionData): Promise<void>;

    /**
     * Saves the session data with expiration.
     * 
     * @param sessionData Session data
     * @param expInSeconds Time to live in seconds
     */
    saveSessionDataWithTtl(sessionData: SessionData, expInSeconds: number): Promise<void>;

    /**
     * Returns the session data.
     * 
     * @param userId User id
     */
    getSessionData(userId: number): Promise<SessionData>;

    /**
     * Delete session object from storage.
     * 
     * @param userId User id
     */
    deleteSession(userId: number): Promise<void>;

    /**
     * Returns active session count.
     */
    getActiveSessionsCount(): Promise<number>;

    /**
     * Generates and returns new session id.
     */
    generateSessionId(): Promise<number>;

    /**
     * Resets the TTL counter.
     * 
     * @param userId User id
     */
    extendSession(userId: number): void;

}

/**
 * Redis session repository.
 */
export class RedisSessionRepository implements SessionRepository {
    constructor(
        private redisClient: RedisClient,
        private expirationEnabled: boolean = true,
        private expirationInMinutes: number = DEFAULT_SESSION_EXPIRATION,
    ) { }

    saveSessionData(sessionData: SessionData): Promise<void> {
        return this.saveSessionDataWithTtl(sessionData, this.expirationEnabled ? (this.expirationInMinutes * 60) : undefined);
    }

    saveSessionDataWithTtl(sessionData: SessionData, expInSeconds: number): Promise<void> {
        if (!sessionData) {
            throw new SessionError("Session data must be provided");
        }
        const key = SessionKeyGenerator.generateKey(sessionData.userId);
        return new Promise<void>((resolve, reject) => {
            if (expInSeconds) {
                this.redisClient.set(key, sessionData.serialize(), "EX", expInSeconds, (err: Error) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                this.redisClient.set(key, sessionData.serialize(), (err: Error) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    }

    getSessionData(userId: number): Promise<SessionData> {
        const key = SessionKeyGenerator.generateKey(userId);
        return new Promise<SessionData>(resolve => {
            this.redisClient.get(key, (err: Error, result: string) => {
                if (err) {
                    resolve(undefined);
                } else {
                    const object = JSON.parse(result);
                    if (object) {
                        resolve(object as SessionData);
                    } else {
                        resolve(undefined);
                    }
                }
            });
        });
    }

    deleteSession(userId: number): Promise<void> {
        const key = SessionKeyGenerator.generateKey(userId);
        return new Promise<void>(resolve => {
            this.redisClient.del(key, (err: Error, result: any) => {
                resolve();
            });
        });
    }

    getActiveSessionsCount(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.redisClient.keys(SESSION_KEY_REGEXP, (err: Error, result: string[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result ? result.length : 0);
                }
            });
        });
    }

    async generateSessionId(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.redisClient.incrby(SESSION_ID_KEY, INCR_DELTA, (err: Error, result: number) => {
                if (err) {
                    reject(err);
                } else {
                    if (!result || result == DEFAULT_REDIS_INCR_VALUE) {
                        new Promise<number>((_resolve, _reject) => {
                            let millisNow = new Date().getMilliseconds();
                            this.redisClient.incrby(SESSION_ID_KEY, millisNow, (err: Error, result: number) => {
                                if (err) {
                                    _reject(err);
                                } else {
                                    resolve(result);
                                }
                            });
                        });
                    } else {
                        resolve(result);
                    }
                }
            });
        });
    }

    extendSession(userId: number): void {
        const key = SessionKeyGenerator.generateKey(userId);
        this.redisClient.expire(key, this.expirationInMinutes * 60);
    }

}
