import { prisma } from './prisma-client';
import { hashSync } from 'bcrypt';




async function up() {
    await prisma.user.createMany({
        data: [
            {
                fullName: 'Dmytro Sulym',
                email: 'ds.intelserv@gmail.com',
                password: hashSync('12345678', 10),
                verified: new Date(),
                role: 'ADMIN',
            },
        ],
    });

}

async function down() {
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Report" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "VerificationCode" RESTART IDENTITY CASCADE`;
}

async function main() {
    try {
        await down();
        await up();
    } catch (e) {
        console.error(e);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });