import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { catchAsync } from '../utils/catchAsync';

export const getProducts = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const storeId = req.query.storeId as string;

    const result = await productService.getProducts({ page, limit, search, storeId });
    res.status(200).json(result);
});

export const getProductById = catchAsync(async (req: Request, res: Response) => {
    const product = await productService.getProductById(req.params.id as string);
    res.status(200).json(product);
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await productService.updateProduct(req.params.id as string, req.body);
    res.status(200).json(product);
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    await productService.deleteProduct(req.params.id as string);
    res.status(204).send();
});
