import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { catchAsync } from '../utils/catchAsync';

export class ProductController {
    constructor(private readonly productService: ProductService) { }

    public getProducts = catchAsync(async (req: Request, res: Response) => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
        const search = req.query.search as string;
        const storeId = req.query.storeId as string;
        const category = req.query.category as string;
        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
        const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
        const inStock = req.query.inStock as string;

        const result = await this.productService.getProducts({ page, limit, search, storeId, category, minPrice, maxPrice, inStock });
        res.status(200).json(result);
    });

    public getCategories = catchAsync(async (req: Request, res: Response) => {
        const categories = await this.productService.getCategories();
        res.status(200).json(categories);
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
