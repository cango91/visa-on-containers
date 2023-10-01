import { promisify } from "util";
import client from "./config-redis";

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const decrAsync = promisify(client.decr).bind(client);
const expireAsync = promisify(client.expire).bind(client);
const rateLimitCounter = 'emailRateLimit';


interface IRateLimiter {
    init: () => Promise<void>;
    allow: () => Promise<boolean>;
}

const rateLimiter: IRateLimiter = {
    init: async () => {
        await setAsync(rateLimitCounter, "600", "EX", 60);
    },
    allow: async () => {
        const currentRate = await getAsync(rateLimitCounter);
        if (currentRate && parseInt(currentRate) <= 0) {
            return false;
        }

        await decrAsync(rateLimitCounter);
        if (!currentRate) {
            await expireAsync(rateLimitCounter, 60);
        }
        return true;
    }
}

export default rateLimiter;