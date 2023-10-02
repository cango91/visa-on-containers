import mongoose from "mongoose";
import crypto from 'crypto';
import redisClient from "./config-redis";

const { AUTH_SIGN_SECRET } = process.env;
const RETRY_WINDOW = 900;
const MAX_RETRIES = 3;

interface IVerificationCache {
    user: string | mongoose.Types.ObjectId;
    token: string;
}

interface IVerificationCacheCounter {
    counter: number;
}

function generateToken() {
    return `verify_${crypto.randomBytes(16).toString('hex')}`;
}

function signToken(token: string) {
    const encoded = btoa(token);
    const hmac = crypto.createHmac('sha256', AUTH_SIGN_SECRET!);
    hmac.update(encoded);
    const signature = hmac.digest('base64');
    return `${encoded}.${signature}`;
}

function verifySignedToken(token: string) {
    const [encoded, signature] = token.split('.');
    const hmac = crypto.createHmac('sha256', AUTH_SIGN_SECRET!);
    hmac.update(encoded);
    return signature === hmac.digest('base64');
}

function createTokenForUser(user: string | mongoose.Types.ObjectId) {
    const token = generateToken();
    const signedToken = signToken(token);
    const verification: IVerificationCache = {
        token: signedToken,
        user
    }
    return verification;
}

export async function createAndCacheTokenForUser(user: string | mongoose.Types.ObjectId) {
    try {
        const cached = await redisClient.get(`verification:${user}`);
        let counter = 0;
        if (cached) {
            const storedToken: IVerificationCache & IVerificationCacheCounter = JSON.parse(cached);
            counter = storedToken.counter + 1;
        }
        if (counter > MAX_RETRIES) throw new Error("Max retries reached");
        const verification: IVerificationCache = createTokenForUser(user);
        const verificationCache: IVerificationCache & IVerificationCacheCounter = {
            counter,
            ...verification
        };
        await (redisClient.set as any)(`verification:${user}`, JSON.stringify(verificationCache), 'EX', RETRY_WINDOW);
        return verificationCache;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function onCallback(token: string) {

}

export async function resendToken(user: string | mongoose.Types.ObjectId){
    
}