import { Router } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { validate } from '../middleware/validate';

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
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const storeId = req.query.storeId as string;

        const skip = (page - 1) * limit;

        // Build the query dynamically
        const where: any = {};

        if (search) {
            where.name = { contains: search };
            // SQLite prisma doesn't support insensitive easily without raw queries or specific setup,
            // but 'contains' in newer Prisma SQLite defaults to case-insensitive depending on collation.
            // Easiest is to stick to contains.
        }

        if (storeId) {
            where.storeId = storeId;
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                include: { store: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id as string },
            include: { store: true }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        next(err);
    }
});

// POST /api/products
router.post('/', validate(CreateProductSchema), async (req, res, next) => {
    try {
        const product = await prisma.product.create({
            data: req.body
        });
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
});

// PUT /api/products/:id
router.put('/:id', validate(UpdateProductSchema), async (req, res, next) => {
    try {
        const product = await prisma.product.update({
            where: { id: req.params.id as string },
            data: req.body
        });
        res.json(product);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await prisma.product.delete({
            where: { id: req.params.id as string }
        });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
