import { PrismaClient } from '@prisma/client';
import { App } from './app';

import { StoreService } from './services/store.service';
import { ProductService } from './services/product.service';

import { StoreController } from './controllers/store.controller';
import { ProductController } from './controllers/product.controller';

import { StoreRoute } from './routes/store.route';
import { ProductRoute } from './routes/product.route';

const requiredEnv = ['DATABASE_URL'];
for (const key of requiredEnv) {
    if (!process.env[key]) {
        console.error(`Missing required environment variable: ${key}`);
        process.exit(1);
    }
}

const prisma = new PrismaClient();

const storeService = new StoreService(prisma);
const productService = new ProductService(prisma);

const storeController = new StoreController(storeService);
const productController = new ProductController(productService);

const storeRoute = new StoreRoute(storeController);
const productRoute = new ProductRoute(productController);

const app = new App([
    storeRoute,
    productRoute
]);

app.listen();

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
