import { PrismaClient } from '@prisma/client';
import { App } from './app';

import { StoreService } from './services/store.service';
import { ProductService } from './services/product.service';

import { StoreController } from './controllers/store.controller';
import { ProductController } from './controllers/product.controller';

import { StoreRoute } from './routes/store.route';
import { ProductRoute } from './routes/product.route';

// 1. Initialize Database Access
const prisma = new PrismaClient();

// 2. Initialize Services
const storeService = new StoreService(prisma);
const productService = new ProductService(prisma);

// 3. Initialize Controllers
const storeController = new StoreController(storeService);
const productController = new ProductController(productService);

// 4. Initialize Routes
const storeRoute = new StoreRoute(storeController);
const productRoute = new ProductRoute(productController);

// 5. Build and Start App Composition Root
const app = new App([
    storeRoute,
    productRoute
]);

app.listen();

// Handle unexpected shutdown gracefully
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
