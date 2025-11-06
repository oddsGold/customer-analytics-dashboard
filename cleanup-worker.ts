import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { env } from './shared/lib/env';
import fs from 'fs/promises'; // Використовуємо 'fs/promises' для async/await
import path from 'path';

const prisma = new PrismaClient();

const REDIS_CONNECTION = {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: parseInt(env('REDIS_PORT', '6379'), 10)
};

// Налаштування очищення
const CLEANUP_DAYS = parseInt(env('REPORT_CLEANUP_DAYS', '7'), 10);

/**
 * Отримує локальний шлях до файлу зі звітом.
 * ПРИПУЩЕННЯ: Ваші звіти зберігаються в папці 'public/reports/'.
 * Якщо це не так, вам потрібно буде змінити цю логіку.
 */
function getFilePathFromUrl(downloadUrl: string): string | null {
    try {
        // Приклад URL: 'http://localhost:3000/reports/123.csv'
        const url = new URL(downloadUrl);
        // Отримуємо '/reports/123.csv'
        const urlPath = url.pathname;

        // Повертаємо шлях відносно кореня проекту,
        // припускаючи, що папка 'reports' лежить в 'public'
        // path.join('public', urlPath) -> 'public/reports/123.csv'
        return path.join(process.cwd(), 'public', urlPath);

    } catch (error) {
        console.error(`[Cleanup] Некоректний URL звіту: ${downloadUrl}`);
        return null;
    }
}

// 1. Створюємо воркера для НОВОЇ черги 'cleanup-jobs'
const cleanupWorker = new Worker('cleanup-jobs', async (job) => {
    // 2. Ми очікуємо на одне завдання з іменем 'delete-old-reports'
    if (job.name === 'delete-old-reports') {
        console.log(`[Cleanup] 🧹 Починаю завдання очищення старих звітів...`);

        // 3. Визначаємо дату "зрізу"
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_DAYS);
        console.log(`[Cleanup] Будуть видалені звіти, створені до: ${cutoffDate.toISOString()}`);

        // 4. Знаходимо всі звіти, які:
        //    - Успішно завершені
        //    - Мають посилання на завантаження (тобто, ще не видалені)
        //    - Старші за нашу "дату зрізу"
        const reportsToDelete = await prisma.report.findMany({
            where: {
                status: 'COMPLETED',
                downloadUrl: { not: null },
                completedAt: { lt: cutoffDate }
            }
        });

        if (reportsToDelete.length === 0) {
            console.log(`[Cleanup] ✅ Старих звітів для видалення не знайдено.`);
            return;
        }

        console.log(`[Cleanup] 🔎 Знайдено ${reportsToDelete.length} звіт(ів) для видалення.`);
        let deletedCount = 0;

        // 5. Проходимо по кожному звіту
        for (const report of reportsToDelete) {
            if (!report.downloadUrl) continue;

            const filePath = getFilePathFromUrl(report.downloadUrl);
            if (!filePath) continue;

            try {
                // 6. Видаляємо файл з диска
                await fs.unlink(filePath);
                console.log(`[Cleanup] 🗑️ Файл видалено: ${filePath}`);

                // 7. Оновлюємо БД (помітка, що файл видалено)
                await prisma.report.update({
                    where: { id: report.id },
                    data: {
                        // Найпростіший спосіб - просто видалити посилання
                        downloadUrl: null
                        // Альтернатива: додати поле `deletedAt: new Date()`
                    }
                });
                deletedCount++;

            } catch (error: any) {
                // Якщо файл вже видалено (помилка 'ENOENT'),
                // ми все одно оновимо БД, щоб не намагатися видалити його знову
                if (error.code === 'ENOENT') {
                    console.warn(`[Cleanup] 🤷 Файл вже був відсутній: ${filePath}`);
                    await prisma.report.update({
                        where: { id: report.id },
                        data: { downloadUrl: null }
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