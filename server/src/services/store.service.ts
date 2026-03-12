import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

export class StoreService {
    constructor(private readonly prisma: PrismaClient) { }

    public async getAllStores() {
        return this.prisma.store.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    public async getStoreById(id: string) {
        const store = await this.prisma.store.findUnique({
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
