import { ProductService } from '../product.service';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/AppError';

const mockProductFindMany = jest.fn();
const mockProductCount = jest.fn();
const mockProductFindUnique = jest.fn();
const mockProductCreate = jest.fn();
const mockProductUpdate = jest.fn();
const mockProductDelete = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    product: {
      findMany: mockProductFindMany,
      count: mockProductCount,
      findUnique: mockProductFindUnique,
      create: mockProductCreate,
      update: mockProductUpdate,
      delete: mockProductDelete,
    },
  })),
}));

describe('ProductService', () => {
  let productService: ProductService;
  let mockPrisma: PrismaClient;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    productService = new ProductService(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return paginated products with search and storeId', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', store: { name: 'Store 1' } },
        { id: '2', name: 'Product 2', store: { name: 'Store 2' } },
      ];
      const mockTotal = 2;

      mockProductFindMany.mockResolvedValue(mockProducts);
      mockProductCount.mockResolvedValue(mockTotal);

      const result = await productService.getProducts({
        page: 1,
        limit: 10,
        search: 'Product',
        storeId: 'store1',
      });

      expect(mockProductFindMany).toHaveBeenCalledWith({
        where: {
          name: { contains: 'Product', mode: 'insensitive' },
          storeId: 'store1',
        },
        skip: 0,
        take: 10,
        include: { store: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockProductCount).toHaveBeenCalledWith({
        where: {
          name: { contains: 'Product', mode: 'insensitive' },
          storeId: 'store1',
        },
      });
      expect(result).toEqual({
        data: mockProducts,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should return products without search and storeId', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1', store: { name: 'Store 1' } }];
      const mockTotal = 1;

      mockProductFindMany.mockResolvedValue(mockProducts);
      mockProductCount.mockResolvedValue(mockTotal);

      const result = await productService.getProducts({ page: 1, limit: 10 });

      expect(mockProductFindMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: { store: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: mockProducts,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });

  describe('getProductById', () => {
    it('should return product if found', async () => {
      const mockProduct = { id: '1', name: 'Product 1', store: { name: 'Store 1' } };
      mockProductFindUnique.mockResolvedValue(mockProduct);

      const result = await productService.getProductById('1');

      expect(mockProductFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { store: true },
      });
      expect(result).toBe(mockProduct);
    });

    it('should throw AppError if product not found', async () => {
      mockProductFindUnique.mockResolvedValue(null);

      await expect(productService.getProductById('1')).rejects.toThrow(AppError);
      await expect(productService.getProductById('1')).rejects.toThrow('Product not found');
    });
  });

  describe('createProduct', () => {
    it('should create and return product', async () => {
      const mockData = { name: 'New Product', storeId: 'store1' };
      const mockProduct = { id: '1', ...mockData };
      mockProductCreate.mockResolvedValue(mockProduct);

      const result = await productService.createProduct(mockData);

      expect(mockProductCreate).toHaveBeenCalledWith({ data: mockData });
      expect(result).toBe(mockProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update and return product', async () => {
      const mockData = { name: 'Updated Product' };
      const mockProduct = { id: '1', name: 'Updated Product' };
      mockProductUpdate.mockResolvedValue(mockProduct);

      const result = await productService.updateProduct('1', mockData);

      expect(mockProductUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: mockData,
      });
      expect(result).toBe(mockProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should delete and return product', async () => {
      const mockProduct = { id: '1', name: 'Product 1' };
      mockProductDelete.mockResolvedValue(mockProduct);

      const result = await productService.deleteProduct('1');

      expect(mockProductDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(mockProduct);
    });
  });
});