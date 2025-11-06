import { Queue, Repeat } from 'bullmq';
import { env } from './shared/lib/env';

const REDIS_CONNECTION = {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: parseInt(env('REDIS_PORT', '6379'), 10)
};

const CLEANUP_CRON = env('REPORT_CLEANUP_CRON', '0 3 * * *');

const cleanupQueue = new Queue('cleanup-jobs', {
    connection: REDIS_CONNECTION,
});

async function scheduleCleanup() {
    try {
        // Використовуємо Repeat для роботи з повторюваними завданнями
        const repeat = new Repeat('cleanup-scheduler', {
            connection: REDIS_CONNECTION
        });

        // Отримуємо всі повторювані завдання
        const jobs = await repeat.getRepeatableJobs(0, -1, true);

        // Видаляємо всі існуючі повторювані завдання для цієї черги
        for (const job of jobs) {
            if (job.name === 'delete-old-reports') {
                await repeat.removeRepeatableByKey(job.key);
            }
        }

        await repeat.close();

        // Додаємо нове повторюване завдання
        await cleanupQueue.add(
            'delete-old-reports',
            {},
            {
                repeat: {
                    pattern: CLEANUP_CRON,
                    jobId: 'daily-report-cleanup'
                },
                removeOnComplete: true,
                removeOnFail: false
            }
        );

        console.log(`✅ Завдання очищення "delete-old-reports" успішно заплановано.`);
        console.log(`Воно буде запускатися за CRON-виразом: ${CLEANUP_CRON}`);

    } catch (error) {
        console.error('Помилка при плануванні завдання очищення:', error);
        throw error;
    } finally {
        await cleanupQueue.close();
    }
}

scheduleCleanup().catch(err => {
    console.error('Не вдалося запланувати завдання очищення:', err);
    process.exit(1);
});