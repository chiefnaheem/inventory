/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    if (process.env.NODE_ENV === 'production') {
        console.log('Skipping seed in production environment.');
        return;
    }

    console.log('Seeding database...');

    await prisma.product.deleteMany();
    await prisma.store.deleteMany();

    const store1 = await prisma.store.create({
        data: {
            name: 'Downtown Tech Hub',
            location: '123 Main St, City Center',
        },
    });

    const store2 = await prisma.store.create({
        data: {
            name: 'Suburban Electronics',
            location: '456 Oak Ave, Suburbia',
        },
    });

    const categories = ['Laptops', 'Smartphones', 'Accessories', 'Audio'];

    await prisma.product.createMany({
        data: [
            { storeId: store1.id, name: 'MacBook Pro 16"', category: categories[0], price: 2499.99, quantity: 15 },
            { storeId: store1.id, name: 'iPhone 15 Pro', category: categories[1], price: 999.99, quantity: 42 },
            { storeId: store1.id, name: 'AirPods Pro', category: categories[3], price: 249.99, quantity: 100 },
            { storeId: store1.id, name: 'USB-C Cable', category: categories[2], price: 19.99, quantity: 200 },
            { storeId: store2.id, name: 'Dell XPS 15', category: categories[0], price: 1899.99, quantity: 8 },
            { storeId: store2.id, name: 'Samsung Galaxy S24', category: categories[1], price: 899.99, quantity: 30 },
            { storeId: store2.id, name: 'Sony WH-1000XM5', category: categories[3], price: 349.99, quantity: 12 },
            { storeId: store2.id, name: 'Logitech MX Master 3S', category: categories[2], price: 99.99, quantity: 25 },
        ],
    });

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
