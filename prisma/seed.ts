import { prisma } from './prisma-client';
import { hashSync } from 'bcrypt';
import { Prisma } from '@prisma/client';

async function up() {
    const adminUser = await prisma.user.create({
        data: {
            fullName: 'Andrii Shamanskiy',
            email: 'andrii.shamanskiy@linkos.ua',
            password: hashSync('12345678', 10),
            verified: new Date(),
            role: 'ADMIN',
        },
    });
    const user = await prisma.user.create({
        data: {
            fullName: 'Dmytro Sulym',
            email: 'ds.intelserv@gmail.com',
            password: hashSync('123456789', 10),
            verified: new Date(),
            role: 'ADMIN',
        },
    });

    const cashalotCategory = await prisma.category.create({
        data: {
            name: 'Cashalot',
            authorId: adminUser.id,
        }
    });

    await prisma.category.create({
        data: {
            name: 'Sota.Kassa',
            authorId: adminUser.id,
        }
    });


    const modulesToCreate: Prisma.ModuleCreateManyInput[] = [
        {
            name: 'каса Cashalot',
            moduleId: 1,
            authorId: adminUser.id,
            categoryId: cashalotCategory.id,
            isPublished: true
        },
        {
            name: 'FSAPI',
            moduleId: 2,
            authorId: adminUser.id,
            categoryId: cashalotCategory.id,
            isPublished: true
        },
        {
            name: 'COM/ApiBridge',
            moduleId: 3,
            authorId: adminUser.id,
            categoryId: cashalotCategory.id,
            isPublished: true
        },
        {
            name: 'драйвер BAS',
            moduleId: 4,
            authorId: adminUser.id,
            categoryId: cashalotCategory.id,
            isPublished: true
        },
        {
            name: 'каса + драйвер COM/ApiBridge',
            moduleId: 5,
            authorId: adminUser.id,
            categoryId: cashalotCategory.id,
            isPublished: true
        },
        {
            name: 'каса + драйвер BAS',
            moduleId: 6,
            authorId: adminUser.id,
            categoryId: cashalotCategory.id,
            isPublished: true
        },
        {
            name: 'Cклад',
            moduleId: 101,
            authorId: adminUser.id,
            categoryId: cashalotCategory.id,
            isPublished: true
        }
    ];

    await prisma.module.createMany({
        data: modulesToCreate
    });
}

async function down() {
    await prisma.$executeRaw`TRUNCATE TABLE "VerificationCode" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "ReportItem" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Report" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Module" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;

    console.log('🗑️ Базу даних очищено.');
}


async function main() {
    try {
        await down();
        await up();
    } catch (e) {
        console.error('❌ Помилка під час виконання seed-скрипта:', e);
    }
}

main()
    .then(async () => {
        console.log('✅ Seed-скрипт успішно завершено.');
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });