import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
import { ILocalAuthRequest, IAuthResponse } from '@cango91/visa-on-containers-common';
import * as tokenService from '../utilities/token-service';
import { IUser } from '../utilities/config-passport';
import User, { IUserDocument } from '../models/user';
import RefreshToken from '../models/refresh-token';
import { createAndCacheTokenForUser, resendToken, verifyToken } from '../utilities/verification-service';
import { getChannel } from '../utilities/config-amqp';
import { toSeconds } from '../utilities/utils';
import redisClient from '../utilities/config-redis';

const TOKEN_EXPIRES = "24h";
const { AUTH_JWT_EXPIRE } = process.env;

export async function getOAuthUrl(req: Request, res: Response, next: NextFunction) {
    try {
        const state = crypto.randomBytes(16).toString('hex');
        const { AUTH_GOOGLE_CLIENT_ID, AUTH_GOOGLE_CALLBACK } = process.env;
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${AUTH_GOOGLE_CLIENT_ID}&redirect_uri=${AUTH_GOOGLE_CALLBACK}&response_type=code&scope=profile email&state=${state}&prompt=select_account`;
        res.status(200).json({ url });
    } catch (error) {
        res.status(400).json(error);
    }
}

export async function handleGoogleCallback(req: Request, res: Response, next: NextFunction) {
    try {
        let userId = (req.user as IUser)._id;
        const response: IAuthResponse = await handleTokens(userId);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json(error);
    }
}

export async function loginLocal(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password }: ILocalAuthRequest = req.body;
        const user: IUserDocument | null = await User.findOne({ email });
        if (user && await user.checkPassword(password)) {
            const userId = user._id;
            const response: IAuthResponse = await handleTokens(userId);
            return res.status(200).json(response);
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(400).json(error);
    }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password }: ILocalAuthRequest = req.body;
        const user = await User.create({
            email,
            password,
        });

        const verification = await createAndCacheTokenForUser(user._id);
        const channel = getChannel();
        const messagePayload = {
            token: verification.token,
            email: user.email
        }
        channel.publish('auth-exchange', 'auth.token', Buffer.from(JSON.stringify(messagePayload)), { messageId: uuid() });
        const response: IAuthResponse = await handleTokens(user._id);
        res.status(201).json(response);
    } catch (error) {
        res.status(400).json(error);
    }
}

export async function verify(req: Request, res: Response) {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Bad request" });
        const parsed = verifyToken(String(token));
        if (!parsed) return res.status(403).json({ message: "Invalid token" });
        if (Date.now() - parsed.timestamp >= toSeconds(TOKEN_EXPIRES)! * 1000) return res.status(400).json({ message: "Token expired" });
        const user = await User.findOneAndUpdate({ _id: parsed.user }, { emailVerified: true }, { upsert: false, new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "Email verified" });
    } catch (error) {
        res.status(400).json(error);
    }
}

export async function resend(req: Request, res: Response) {
    try {
        const { user } = req.body;
        if (!user) return res.status(400).json({ message: "Bad request" });
        const foundUser = await User.findById(user);
        if (foundUser?.emailVerified) return res.status(403).json({ message: "Email already verified" });
        const verification = await resendToken(user);
        if (!verification) return res.status(429).json({ message: "Too many requests. Retry later." });
        const channel = getChannel();
        const messagePayload = {
            token: verification.token,
            email: user.email
        };
        channel.publish('auth-exchange', 'auth.token', Buffer.from(JSON.stringify(messagePayload)), { messageId: uuid() });
        res.status(200).json({ message: "token resent" });
    } catch (error) {
        res.status(400).json(error);
    }
}

export async function refresh(req: Request, res: Response) {
    try {
        const { accessToken, refreshToken } = req.body;
        if (!accessToken || !refreshToken) throw new Error("Missing credentials");
        const foundUser = await User.findById(tokenService.parseJwt(accessToken).payload._id);
        if (!foundUser) return res.status(404).json({ message: "Not found" });
        const newTokens = await tokenService.refreshTokens(accessToken, refreshToken);
        res.status(200).json({ accessToken: newTokens?.accessToken, refreshToken: newTokens?.refreshToken });
    } catch (error) {
        res.status(400).json(error);
    }
}

export async function logout(req: Request, res: Response) {
    try {
        const { refreshToken } = req.body;
        const tk = await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true }, { new: true, upsert: false });
        if (!tk) return res.status(400).json({ message: "Not found. Can't logout" });
        await redisClient.del(`refresh:${refreshToken}`);
        res.status(204).json({ message: "Logged out" });
    } catch (error) {
        res.status(400).json(error);
    }
}

async function handleTokens(userId: string | mongoose.Types.ObjectId) {
    userId = userId instanceof mongoose.Types.ObjectId ? userId : new mongoose.Types.ObjectId(userId);
    const accessToken = tokenService.createJwt({ _id: userId });
    const refreshToken = tokenService.createRefreshToken({ _id: userId });
    const wholeToken = await RefreshToken.findOneAndUpdate({ token: refreshToken }, {
        token: refreshToken,
        expires: new Date(tokenService.parseJwt(refreshToken).exp * 1000),
        user: userId
    }, {
        upsert: true,
        new:true,
    });
    await (redisClient.set as any)(`refresh:${userId}`, JSON.stringify(wholeToken), 'EX', toSeconds(AUTH_JWT_EXPIRE!)! * 2);
    return { accessToken, refreshToken };
}