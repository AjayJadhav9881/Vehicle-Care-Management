import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured.');
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token is required.',
      });
      return;
    }

    const token = authorization.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded !== 'object' ||
      !decoded ||
      !('userId' in decoded) ||
      !('email' in decoded)
    ) {
      res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
      return;
    }

    req.user = {
      userId: String(decoded.userId),
      email: String(decoded.email),
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};