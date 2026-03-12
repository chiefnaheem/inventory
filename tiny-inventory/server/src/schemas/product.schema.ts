import { z } from 'zod';

export const CreateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        category: z.string().min(1, 'Category is required'),
        price: z.number().positive('Price must be positive'),
        quantity: z.number().int().nonnegative('Quantity cannot be negative').default(0),
        storeId: z.string().min(1, 'Store ID is required')
    })
});

export const UpdateProductSchema = z.object({
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
