import {auth} from "../lib/auth.js";
import type {Request, Response, NextFunction} from "express";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
        headers: req.headers
    });

    if (!session) {
        return res.status(401).json({error: "Unauthorized"});
    }

    req.user = session.user as any;
    next();
};

export const roleMiddleware = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({error: "Unauthorized"});
        }

        if (!roles.includes(req.user.role as string)) {
            return res.status(403).json({error: "Forbidden", message: "You do not have permission to perform this action"});
        }

        next();
    };
};
