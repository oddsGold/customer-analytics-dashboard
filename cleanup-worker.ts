import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { env } from './shared/lib/env';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

const REDIS_CONNECTION = {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: parseInt(env('REDIS_PORT', '6379'), 10)
};

const CLEANUP_DAYS = parseInt(env('REPORT_CLEANUP_DAYS', '7'), 10);

function getFilePathFromUrl(downloadUrl: string): string | null {
    try {
        const relativePath = downloadUrl.startsWith('/')
            ? downloadUrl.substring(1)
            : downloadUrl;

        return path.join(process.cwd(), 'public', relativePath);

    } catch (error) {
        console.error(`[Cleanup] Некоректний URL звіту: ${downloadUrl}`);
        return null;
    }
}

const cleanupWorker = new Worker('cleanup-jobs', async (job) => {
    if (job.name === 'delete-old-reports') {
        console.log(`[Cleanup] 🧹 Починаю завдання очищення старих звітів...`);

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_DAYS);
        console.log(`[Cleanup] Будуть видалені звіти, створені до: ${cutoffDate.toISOString()}`);

        const reportsToDelete = await prisma.report.findMany({
            where: {
                status: 'COMPLETED',
                downloadUrl: { not: null },
                completedAt: { lt: cutoffDate },
                deletedAt: null
            }
        });

        if (reportsToDelete.length === 0) {
            console.log(`[Cleanup] ✅ Старих звітів для видалення не знайдено.`);
            return;
        }

        console.log(`[Cleanup] 🔎 Знайдено ${reportsToDelete.length} звіт(ів) для видалення.`);
        let deletedCount = 0;

        for (const report of reportsToDelete) {
            if (!report.downloadUrl) continue;

            const filePath = getFilePathFromUrl(report.downloadUrl);
            if (!filePath) continue;

            try {
                await fs.unlink(filePath);
                console.log(`[Cleanup] 🗑️ Файл видалено: ${filePath}`);

                await prisma.report.update({
                    where: { id: report.id },
                    data: {
                        deletedAt: new Date()
                    }
                });
                deletedCount++;

            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    console.warn(`[Cleanup] 🤷 Файл вже був відсутній: ${filePath}`);

                    await prisma.report.update({
                        where: { id: report.id },
                        data: { deletedAt: new Date() }
                    });
                } else {
                    console.error(`[Cleanup] ❌ Помилка при видаленні файлу ${filePath}:`, error.message);
                }
            }
        }
        console.log(`[Cleanup] ✅ Завдання завершено. Успішно видалено ${deletedCount} з ${reportsToDelete.length} звітів.`);
    }
}, { connection: REDIS_CONNECTION });

cleanupWorker.on('failed', (job, err) => {
    console.error(`[Cleanup] ☠️ Завдання ${job?.name} провалилося:`, err.message);
});

cleanupWorker.on('error', err => {
    console.error(`[Cleanup] ☠️ Критична помилка воркера очищення:`, err.message);
});

console.log("🚀 Воркер очищення (cleanup-worker) запущений і чекає на завдання...");