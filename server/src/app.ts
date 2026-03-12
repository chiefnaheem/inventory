import express from 'express';
import cors from 'cors';
import { IRoute } from './interfaces/route.interface';
import { errorHandler } from './middleware/errorHandler';

export class App {
    public app: express.Application;
    public port: string | number;

    constructor(routes: IRoute[]) {
        this.app = express();
        this.port = process.env.PORT || 8080;

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

    private initializeMiddlewares() {
        this.app.use(cors());
        this.app.use(express.json());

        // Health Check
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
