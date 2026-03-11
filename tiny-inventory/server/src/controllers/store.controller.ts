import { Request, Response } from 'express';
import { storeService } from '../services/store.service';
import { catchAsync } from '../utils/catchAsync';

export const getAllStores = catchAsync(async (req: Request, res: Response) => {
    const stores = await storeService.getAllStores();
    res.status(200).json(stores);
});

export const getStoreById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const storeData = await storeService.getStoreById(id as string);
    res.status(200).json(storeData);
});
