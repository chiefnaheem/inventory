import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';


    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} — ${err.message}`);
    if (err.stack) console.error(err.stack);

    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {

        res.status(500).json({
            status: 'error',
            message: 'An internal error occurred.',
        });
    }
};
