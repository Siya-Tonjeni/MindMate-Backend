import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
userId: string;
}

export const authMiddleware = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ error: 'No token' });

    const parts = header.split(' ');

    if (parts.length !== 2) return res.status(401).json({ error: 'Invalid token' });

    const token = parts[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
        req.user = { id: payload.userId };
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}