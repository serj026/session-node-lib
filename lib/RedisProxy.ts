import { RedisClient, ClientOpts } from "redis";
import redis from "redis";

/**
 * Redis proxy.
 */
export class RedisProxy {

    public client: RedisClient;

    constructor(
        private redisHost: string,
        private redisPort: number,
    ) { }

    /**
     * Inits connection to redis.
     */
    init(): Promise<void> {
        if (this.client) {
            return;
        }

        this.client = redis.createClient(this.getConfig());
        this.client.on("error", (err: Error) => {
            throw new Error(`Redis error: ${err}`);
        });
        return new Promise<void>((resolve) => {
            this.client.on("connect", () => resolve());
        });
    }

    private getConfig(): ClientOpts {
        return {
            host: this.redisHost,
            port: this.redisPort,
            retry_strategy: options => {
                if (options.error && options.error.code === "ECONNREFUSED") {
                    return new Error("The server refused the connection");
                }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    return new Error("Retry time exhausted");
                }
                if (options.attempt > 20) {
                    return undefined;
                }
                return Math.min(options.attempt * 100, 3000);
            }
        };
    }

}