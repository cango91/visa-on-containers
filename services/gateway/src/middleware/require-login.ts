import { NextFunction, Request, Response } from "express";

interface IUser {
    _id: string;
}

interface IExtReq {
    user?: IUser | null;
}

export default async function requireLogin(req: Request & IExtReq, res: Response, next: NextFunction) {
    if(req.user) return next();
    res.status(401).json({message: "You must be logged in to access this route"});
}