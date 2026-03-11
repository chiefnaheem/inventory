import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// GET /api/stores
router.get('/', async (req, res, next) => {
    try {
        const stores = await prisma.store.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(stores);
    } catch (err) {
        next(err);
    }
});

// GET /api/stores/:id - Includes non-trivial operation (Aggregation)
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const store = await prisma.store.findUnique({
            where: { id: id as string },
            include: {
                products: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Non-trivial operation: Calculate total inventory value and total products count
        const totalProducts = store.products.length;
        const inventoryValue = store.products.reduce((acc, product) => {
            return acc + (product.price * product.quantity);
        }, 0);

        // Return the augmented store object
        res.json({
            ...store,
            totalProducts,
            inventoryValue
        });
    } catch (err) {
        next(err);
    }
});

export default router;
