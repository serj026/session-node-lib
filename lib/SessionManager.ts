import { SessionData } from "./SessionData";
import { SessionRepository } from "./SessionRepository";
import { InvalidSessionError } from "./errors/InvalidSessionError";

/**
 * Session manager.
 */
export interface SessionManager {

    /**
     * Creates user session.
     * 
     * @param userId User id
     * @param parameters Session params
     */
    createSession(userId: number, parameters: any): Promise<number>;

    /**
     * Validates the session. Throws the InvalidSessionError if session is invalid.
     * 
     * @param userId User id
     * @param sessionId Session id
     */
    validateSession(userId: number, sessionId: number): Promise<void>;

    /**
     * Returns the session data.
     * 
     * @param userId User id
     */
    getSessionData(userId: number): Promise<SessionData>;

    /**
     * Update the session data.
     * 
     * @param sessionData New session data
     */
    updateSession(sessionData: SessionData): Promise<void>;

    /**
     * Delete session from storage.
     * 
     * @param userId User id
     */
    deleteSession(userId: number): Promise<void>;

    /**
     * Returns count of action session (number of keys that present in storage).
     */
    getActiveSessionsCount(): Promise<number>;

}

/**
 * Default session manager.
 */
export class DefaultSessionManager implements SessionManager {
    constructor(
        private repository: SessionRepository
    ) { }

    async createSession(userId: number, parameters: any): Promise<number> {
        const sessionId = await this.repository.generateSessionId();
        const sessionData = new SessionData(userId, sessionId, parameters);
        await this.repository.saveSessionData(sessionData);
        return sessionId;
    }

    async validateSession(userId: number, sessionId: number): Promise<void> {
        const sessionData = await this.repository.getSessionData(userId);
        if (!sessionData || !(sessionData.userId == userId && sessionData.sessionId == sessionId)) {
            throw new InvalidSessionError(userId, sessionId);
        }
        this.repository.extendSession(userId);
    }

    getSessionData(userId: number): Promise<SessionData> {
        return this.repository.getSessionData(userId);
    }

    async updateSession(sessionData: SessionData): Promise<void> {
        this.validateSession(sessionData.userId, sessionData.sessionId);
        await this.repository.saveSessionData(sessionData);
    }

    deleteSession(userId: number): Promise<void> {
        return this.repository.deleteSession(userId);
    }

    getActiveSessionsCount(): Promise<number> {
        return this.getActiveSessionsCount();
    }

}
