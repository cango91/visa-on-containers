import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sendServiceRequest } from "../utilities/utils";
import { AUTH_SERVICE_URL } from "../constants";

const { AUTH_JWT_SECRET, AUTH_SERVICE_SECRET } = process.env;

interface IUser {
    _id: string;
}

interface IExtReq {
    user?: IUser | null;
}

export default async function bearer(req: Request & IExtReq, res: Response, next: NextFunction) {
    let token = req.get("Authorization");
    req.user = null;
    if (token) {
        token = token.split(" ")[1];
        try {
            const decoded = jwt.verify(token, AUTH_JWT_SECRET!);
            req.user = (decoded as JwtPayload).payload._id;
        } catch (e: any) {
            if (e.name === 'TokenExpiredError') {
                const clientRefreshToken = req.signedCookies["refreshToken"];
                if (clientRefreshToken) {
                    try {
                        const response = await sendServiceRequest(`${AUTH_SERVICE_URL}/api/auth/refresh`, AUTH_SERVICE_SECRET!, "POST", {
                            accessToken: token,
                            refreshToken: clientRefreshToken,
                        });
                        if (response.ok) {
                            const { accessToken, refreshToken } = await response.json();
                            const decoded = jwt.verify(accessToken, AUTH_JWT_SECRET!);
                            req.user = (decoded as JwtPayload).payload._id;
                            res.set("x-access-token", accessToken);
                            res.cookie("refreshToken", refreshToken, { signed: true, httpOnly: true });
                        }
                    } catch (error) {
                    }
                }
            }
        }
    }
    return next();
}