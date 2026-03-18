import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { IRoute } from './interfaces/route.interface';
import { errorHandler } from './middleware/errorHandler';

export class App {
    public app: express.Application;
    public port: string | number;

    constructor(routes: IRoute[]) {
        this.app = express();
        this.port = process.env.PORT || 8080;

        this.initializeSecurityMiddlewares();
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Server listening on port ${this.port}`);
        });
    }

    public getServer() {
        return this.app;
    }

    private initializeSecurityMiddlewares() {
        
        this.app.use(helmet());

        
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
            message: { status: 'error', message: 'Too many requests, please try again later.' },
        });

        this.app.use('/api', limiter)
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:3000'];
            
        this.app.use(cors({
            origin: allowedOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type'],
            credentials: false,
        }));

        // Request logging
        this.app.use(morgan('combined'));
    }

    private initializeMiddlewares() {
        // Body parsers with size limits to prevent payload attacks
        this.app.use(express.json({ limit: '10kb' }));
        this.app.use(express.urlencoded({ extended: false, limit: '10kb' }));

        // Disable X-Powered-By (defense in depth, helmet also does this)
        this.app.disable('x-powered-by');

        // Health Check (no rate limit — used by Docker healthcheck)
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
    }

    private initializeRoutes(routes: IRoute[]) {
        routes.forEach(route => {
            this.app.use('/', route.router);
        });
    }

    private initializeErrorHandling() {
        this.app.use(errorHandler);
    }
}
