import { z } from 'zod';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CreateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less').trim(),
        category: z.string().min(1, 'Category is required').max(100, 'Category must be 100 characters or less').trim(),
        price: z.number().positive('Price must be positive').max(1_000_000, 'Price exceeds maximum allowed'),
        quantity: z.number().int().nonnegative('Quantity cannot be negative').max(1_000_000, 'Quantity exceeds maximum allowed').default(0),
        storeId: z.string().regex(uuidRegex, 'Store ID must be a valid UUID')
    })
});

export const UpdateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(200).trim().optional(),
        category: z.string().min(1).max(100).trim().optional(),
        price: z.number().positive().max(1_000_000).optional(),
        quantity: z.number().int().nonnegative().max(1_000_000).optional(),
        storeId: z.string().regex(uuidRegex, 'Store ID must be a valid UUID').optional()
    }),
    params: z.object({
        id: z.string().regex(uuidRegex, 'Product ID must be a valid UUID')
    })
});

export const IdParamSchema = z.object({
    params: z.object({
        id: z.string().regex(uuidRegex, 'ID must be a valid UUID')
    })
});
