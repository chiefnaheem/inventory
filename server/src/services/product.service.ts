import { Prisma, PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

export class ProductService {
    constructor(private readonly prisma: PrismaClient) { }

    public async getProducts(params: {
        page: number; limit: number; search?: string; storeId?: string;
        category?: string; minPrice?: number; maxPrice?: number; inStock?: string;
    }) {
        const { page, limit, search, storeId, category, minPrice, maxPrice, inStock } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.ProductWhereInput = {};
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        if (storeId) where.storeId = storeId;
        if (category) where.category = { equals: category, mode: 'insensitive' };
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
        }
        if (inStock === 'true') where.quantity = { gt: 0 };
        if (inStock === 'false') where.quantity = { equals: 0 };

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

    public async getCategories() {
        const results = await this.prisma.product.findMany({
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' },
        });
        return results.map(r => r.category);
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

    public async createProduct(data: Prisma.ProductUncheckedCreateInput) {
        const store = await this.prisma.store.findUnique({ where: { id: data.storeId } });
        if (!store) {
            throw new AppError('Store not found', 404);
        }
        return this.prisma.product.create({ data });
    }

    public async updateProduct(id: string, data: Prisma.ProductUncheckedUpdateInput) {
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
