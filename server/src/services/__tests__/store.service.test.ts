import { StoreService } from '../store.service';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/AppError';

const mockStoreFindMany = jest.fn();
const mockStoreFindUnique = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    store: {
      findMany: mockStoreFindMany,
      findUnique: mockStoreFindUnique,
    },
  })),
}));

describe('StoreService', () => {
  let storeService: StoreService;
  let mockPrisma: PrismaClient;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    storeService = new StoreService(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStores', () => {
    it('should return all stores ordered by createdAt desc', async () => {
      const mockStores = [
        { id: '1', name: 'Store 1', createdAt: new Date() },
        { id: '2', name: 'Store 2', createdAt: new Date() },
      ];
      mockStoreFindMany.mockResolvedValue(mockStores);

      const result = await storeService.getAllStores();

      expect(mockStoreFindMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toBe(mockStores);
    });
  });

  describe('getStoreById', () => {
    it('should return store with products, totalProducts, and inventoryValue', async () => {
      const mockStore = {
        id: '1',
        name: 'Store 1',
        products: [
          { id: 'p1', name: 'Product 1', price: 10, quantity: 5 },
          { id: 'p2', name: 'Product 2', price: 20, quantity: 3 },
        ],
      };
      mockStoreFindUnique.mockResolvedValue(mockStore);

      const result = await storeService.getStoreById('1');

      expect(mockStoreFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          products: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      expect(result).toEqual({
        ...mockStore,
        totalProducts: 2,
        inventoryValue: 10 * 5 + 20 * 3, // 50 + 60 = 110
      });
    });

    it('should throw AppError if store not found', async () => {
      mockStoreFindUnique.mockResolvedValue(null);

      await expect(storeService.getStoreById('1')).rejects.toThrow(AppError);
      await expect(storeService.getStoreById('1')).rejects.toThrow('Store not found');
    });

    it('should calculate inventoryValue correctly with empty products', async () => {
      const mockStore = {
        id: '1',
        name: 'Store 1',
        products: [],
      };
      mockStoreFindUnique.mockResolvedValue(mockStore);

      const result = await storeService.getStoreById('1');

      expect(result).toEqual({
        ...mockStore,
        totalProducts: 0,
        inventoryValue: 0,
      });
    });
  });
});