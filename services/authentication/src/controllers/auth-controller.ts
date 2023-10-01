import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { ILocalAuthRequest, IAuthResponse } from '@cango91/visa-on-containers-common';
import * as tokenService from '../utilities/token-service';
import { IUser } from '../utilities/config-passport';
import User, { IUserDocument } from '../models/user';
import RefreshToken from '../models/refresh-token';
import mongoose from 'mongoose';
import { createAndCacheTokenForUser } from '../utilities/verification-service';
import { getChannel } from '../utilities/config-amqp';

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

        await channel.assertQueue("verificationTokens", { durable: true, exclusive: true });
        const messagePayload = {
            token: verification.token,
            email: user.email
        }
        channel.sendToQueue("verificationTokens", Buffer.from(JSON.stringify(messagePayload)), { messageId: uuid() });
        const response: IAuthResponse = await handleTokens(user._id);
        res.status(201).json(response);
    } catch (error) {
        res.status(400).json(error);
    }
}

async function handleTokens(userId: string | mongoose.Types.ObjectId) {
    userId = userId instanceof mongoose.Types.ObjectId ? userId : new mongoose.Types.ObjectId(userId);
    const accessToken = tokenService.createJwt({ _id: userId });
    const refreshToken = tokenService.createRefreshToken({ _id: userId });
    await RefreshToken.findOneAndUpdate({ token: refreshToken }, {
        token: refreshToken,
        expires: new Date(tokenService.parseJwt(refreshToken).exp * 1000),
        user: userId
    }, {
        upsert: true
    });
    return { accessToken, refreshToken };
}