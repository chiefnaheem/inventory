import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

export class ProductService {
    constructor(private readonly prisma: PrismaClient) { }

    public async getProducts(params: { page: number; limit: number; search?: string; storeId?: string }) {
        const { page, limit, search, storeId } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        if (storeId) where.storeId = storeId;

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                include: { store: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where })
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

    public async getProductById(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { store: true }
        });

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        return product;
    }

    public async createProduct(data: any) {
        const store = await this.prisma.store.findUnique({ where: { id: data.storeId } });
        if (!store) {
            throw new AppError('Store not found', 404);
        }
        return this.prisma.product.create({ data });
    }

    public async updateProduct(id: string, data: any) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        return this.prisma.product.update({
            where: { id },
            data
        });
    }

    public async deleteProduct(id: string) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        return this.prisma.product.delete({
            where: { id }
        });
    }
}
