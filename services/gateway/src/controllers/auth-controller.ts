import { Request, Response } from "express";
import { sendServiceRequest } from "../utilities/utils";
import { AUTH_SERVICE_URL } from "../constants";

const { AUTH_SERVICE_SECRET } = process.env;


export async function signup(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const response = await sendServiceRequest(`${AUTH_SERVICE_URL}/api/auth/signup`, AUTH_SERVICE_SECRET!, "POST", {
            email,
            password
        });
        if (response.ok) {
            const { accessToken, refreshToken } = await response.json();
            res.set("x-access-token", accessToken);
            res.cookie("refreshToken", refreshToken, { signed: true, httpOnly: true });
            res.status(200).json({ accessToken });
        } else {
            return res.status(400).json({ message: "Bad request" });
        }
    } catch (error) {
        res.status(400).json(error);
    }
}

export async function login(req: Request, res: Response) {
    try {
        const {email, password} = req.body;
        const response = await sendServiceRequest(`${AUTH_SERVICE_URL}/api/auth/login`, AUTH_SERVICE_SECRET!, "POST", {
            email,
            password
        });
        if (response.ok) {
            const { accessToken, refreshToken } = await response.json();
            res.set("x-access-token", accessToken);
            res.cookie("refreshToken", refreshToken, { signed: true, httpOnly: true });
            res.status(200).json({ accessToken });
        } else {
            return res.status(400).json({ message: await response.text() });
        }
    } catch (error) {
        res.status(400).json(error);
    }
}
export async function logout(req: Request, res: Response) {
    try {
        let refreshToken=req.signedCookies["refreshToken"];
        const response = await sendServiceRequest(`${AUTH_SERVICE_URL}/api/auth/logout`,AUTH_SERVICE_SECRET!,"POST",{refreshToken});
        if(response.ok){
            return res.status(204).json({});
        }
        return res.status(400).json({message: (await response.json()).message});
    } catch (error) {
        res.status(400).json(error);
    }
}
export async function verify(req: Request, res: Response) {
    try {
        const token = req.query.token;
        if(!token) throw new Error("Invalid verification token");
        const response = await sendServiceRequest(`${AUTH_SERVICE_URL}/api/auth/verify`, AUTH_SERVICE_SECRET!, "POST",{token});
        if(response.ok){
            return res.status(200).json({message:"Email verified successfully"});
        }else{
            return res.status(response.status).json({message: (await response.json()).message});
        }
    } catch (error) {
        res.status(400).json(error);
    }
}
export async function resendVerification(req: Request, res: Response) {
    try {

    } catch (error) {
        res.status(400).json(error);
    }
}
