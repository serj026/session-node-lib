import { SessionManager, DefaultSessionManager } from "./SessionManager";
import { RedisClient } from "redis";
import { RedisSessionRepository } from "./SessionRepository";
import { RedisProxy } from "./RedisProxy";

let sessionManager: SessionManager;

/**
 * Creates the session manager instance.
 * 
 * @param params Session params
 */
export const create = async(params: {
    expirationEnabled: boolean,
    expirationInMinutes: number,
    redisClient?: RedisClient,
    redisConfig?: {
        host: string,
        port: number
    },
}): Promise<void> => {
    let redisClient: RedisClient = await (async (): Promise<RedisClient> => {
        if (sessionManager) {
            return;
        }

        if (!params.redisClient) {
            if (!params.redisConfig) {
                throw new Error("Redis config is not defined");
            }
            const redisProxy = new RedisProxy(params.redisConfig.host, params.redisConfig.port);
            await redisProxy.init();
            return redisProxy.client;
        } else {
            return params.redisClient;
        }
    })();
    const sessionRepository = new RedisSessionRepository(redisClient, params.expirationEnabled, params.expirationInMinutes);
    sessionManager = new DefaultSessionManager(sessionRepository);
};

/**
 * Returns the session manager.
 */
export const getManager = (): SessionManager => {
    return sessionManager;
};
