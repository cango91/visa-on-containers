import { Request, Response, NextFunction } from "express";
const { EMAIL_SERVICE_SECRET } = process.env;
/**
 * Middleware to ensure only authorized requests from internal services are processed.
 */
export default function (req: Request, res: Response, next: NextFunction) {
    const secret = req.headers['x-service-secret'];
    if (!secret || secret !== EMAIL_SERVICE_SECRET) return res.status(403).json({ message: "Forbidden" });
    next();
}