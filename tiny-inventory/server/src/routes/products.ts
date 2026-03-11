import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import * as productController from '../controllers/product.controller';

const router = Router();

// Zod schemas for validation
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

// GET /api/products - Lists products with filtering and pagination
router.get('/', productController.getProducts);

// GET /api/products/:id
router.get('/:id', productController.getProductById);

// POST /api/products
router.post('/', validate(CreateProductSchema), productController.createProduct);

// PUT /api/products/:id
router.put('/:id', validate(UpdateProductSchema), productController.updateProduct);

// DELETE /api/products/:id
router.delete('/:id', productController.deleteProduct);

export default router;
