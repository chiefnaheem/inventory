import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

export const validate = (schema: ZodTypeAny) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues.map((e: any) => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            return next(error);
        }
    };
