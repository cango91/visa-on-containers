import client from "./config-redis";

const rateLimitCounter = 'emailRateLimit';

interface IRateLimiter {
    init: () => Promise<void>;
    allow: () => Promise<boolean>;
}

const rateLimiter: IRateLimiter = {
    init: async () => {
        console.log('initializing rate limiter');

        await (client.set as any)(rateLimitCounter, "600", "EX", 60);
        console.log('rate limiter initialized');
    },
    allow: async () => {
        const currentRate = await client.get(rateLimitCounter);
        if (currentRate && parseInt(currentRate) <= 0) {
            return false;
        }

        await client.decr(rateLimitCounter);
        if (!currentRate) {
            await client.expire(rateLimitCounter, 60);
        }
        return true;
    }
}

export default rateLimiter;