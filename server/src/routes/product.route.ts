import { Router } from 'express';
import { IRoute } from '../interfaces/route.interface';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { CreateProductSchema, UpdateProductSchema } from '../schemas/product.schema';

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
