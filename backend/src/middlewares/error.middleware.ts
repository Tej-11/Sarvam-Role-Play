import type { NextFunction, Request, Response } from "express";

export const errorHandlerMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Global Error Handler:', err);
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    const message = err.message || 'An unexpected error occurred';
    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? 'undefined' : err.stack
    });
}