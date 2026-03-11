import { prisma } from '../index';
import { AppError } from '../utils/AppError';

export class StoreService {
    async getAllStores() {
        return prisma.store.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async getStoreById(id: string) {
        const store = await prisma.store.findUnique({
            where: { id },
            include: {
                products: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!store) {
            throw new AppError('Store not found', 404);
        }

        // Compute non-trivial metrics
        const totalProducts = store.products.length;
        const inventoryValue = store.products.reduce((acc, product) => {
            return acc + (product.price * product.quantity);
        }, 0);

        return {
            ...store,
            totalProducts,
            inventoryValue
        };
    }
}

export const storeService = new StoreService();
