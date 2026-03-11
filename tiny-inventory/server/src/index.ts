import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = process.env.PORT || 8080;

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

import storeRoutes from './routes/stores';
import productRoutes from './routes/products';

// Main health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);

import { errorHandler } from './middleware/errorHandler';

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
