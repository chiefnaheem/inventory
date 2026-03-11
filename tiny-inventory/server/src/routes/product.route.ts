import { Router } from 'express';
import { IRoute } from '../interfaces/route.interface';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const CreateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        category: z.string().min(1, 'Category is required'),
        price: z.number().positive('Price must be positive'),
        quantity: z.number().int().nonnegative('Quantity cannot be negative').default(0),
        storeId: z.string().min(1, 'Store ID is required')
    })
});

const UpdateProductSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        category: z.string().optional(),
        price: z.number().positive().optional(),
        quantity: z.number().int().nonnegative().optional(),
        storeId: z.string().optional()
    }),
    params: z.object({
        id: z.string()
    })
});

export class ProductRoute implements IRoute {
    public path = '/api/products';
    public router = Router();

    constructor(private readonly productController: ProductController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.productController.getProducts);
        this.router.get(`${this.path}/:id`, this.productController.getProductById);
        this.router.post(`${this.path}`, validate(CreateProductSchema), this.productController.createProduct);
        this.router.put(`${this.path}/:id`, validate(UpdateProductSchema), this.productController.updateProduct);
        this.router.delete(`${this.path}/:id`, this.productController.deleteProduct);
    }
}
