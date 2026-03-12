import { Request, Response } from 'express';
import { StoreService } from '../services/store.service';
import { catchAsync } from '../utils/catchAsync';

export class StoreController {
    constructor(private readonly storeService: StoreService) { }

    public getAllStores = catchAsync(async (req: Request, res: Response) => {
        const stores = await this.storeService.getAllStores();
        res.status(200).json(stores);
    });

    public getStoreById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const storeData = await this.storeService.getStoreById(id as string);
        res.status(200).json(storeData);
    });
}
