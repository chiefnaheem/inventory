import { prisma } from '../index';
import { AppError } from '../utils/AppError';

export class ProductService {
    async getProducts(params: { page: number; limit: number; search?: string; storeId?: string }) {
        const { page, limit, search, storeId } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) where.name = { contains: search };
        if (storeId) where.storeId = storeId;

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

        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getProductById(id: string) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { store: true }
        });

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        return product;
    }

    async createProduct(data: any) {
        return prisma.product.create({ data });
    }

    async updateProduct(id: string, data: any) {
        // Check if exists first to return proper 404 potentially, but Prisma handles with its own error on update if not found.
        // We can just try to update and let the global error handler catch P2025.
        return prisma.product.update({
            where: { id },
            data
        });
    }

    async deleteProduct(id: string) {
        return prisma.product.delete({
            where: { id }
        });
    }
}

export const productService = new ProductService();
