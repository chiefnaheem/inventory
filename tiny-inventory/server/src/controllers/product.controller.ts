import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { catchAsync } from '../utils/catchAsync';

export class ProductController {
    constructor(private readonly productService: ProductService) { }

    public getProducts = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const storeId = req.query.storeId as string;

        const result = await this.productService.getProducts({ page, limit, search, storeId });
        res.status(200).json(result);
    });

    public getProductById = catchAsync(async (req: Request, res: Response) => {
        const product = await this.productService.getProductById(req.params.id as string);
        res.status(200).json(product);
    });

    public createProduct = catchAsync(async (req: Request, res: Response) => {
        const product = await this.productService.createProduct(req.body);
        res.status(201).json(product);
    });

    public updateProduct = catchAsync(async (req: Request, res: Response) => {
        const product = await this.productService.updateProduct(req.params.id as string, req.body);
        res.status(200).json(product);
    });

    public deleteProduct = catchAsync(async (req: Request, res: Response) => {
        await this.productService.deleteProduct(req.params.id as string);
        res.status(204).send();
    });
}
