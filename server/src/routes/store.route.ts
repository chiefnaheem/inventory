import { Router } from 'express';
import { IRoute } from '../interfaces/route.interface';
import { StoreController } from '../controllers/store.controller';
import { validate } from '../middleware/validate';
import { IdParamSchema } from '../schemas/product.schema';

export class StoreRoute implements IRoute {
    public path = '/api/stores';
    public router = Router();

    constructor(private readonly storeController: StoreController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.storeController.getAllStores);
        this.router.get(`${this.path}/:id`, validate(IdParamSchema), this.storeController.getStoreById);
    }
}
