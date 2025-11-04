import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { generateReportCsv } from "./shared/lib/generate-report-csv";
import { env } from './shared/lib/env';

const prisma = new PrismaClient();

const REDIS_CONNECTION = {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: parseInt(env('REDIS_PORT', '6379'), 10)
};

const SOCKET_HOST = env('SOCKET_HOST', '127.0.0.1');
const SOCKET_PORT = parseInt(env('SOCKET_PORT', '3001'), 10);
const SOCKET_SERVER_URL = `http://${SOCKET_HOST}:${SOCKET_PORT}`;

const SITE_URL = env('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ✅ Типізуємо 'job'
interface ReportJobData {
    reportId: number;
    userId: number;
}

const worker = new Worker('report-generation', async (job) => {
    // ✅ Використовуємо наш інтерфейс
    const { reportId, userId } = job.data as ReportJobData;

    if (!reportId || !userId) {
        console.error(`☠️ [JOB FAILED] Завдання ${job.id} не має 'reportId' або 'userId'. Дані:`, job.data);
        throw new Error("Missing reportId or userId in job data");
    }

    console.log(`[JOB START] Починаю звіт ${reportId} для юзера ${userId}`);

    try {
        await prisma.report.update({
            where: { id: reportId },
            data: { status: 'PROCESSING' }
        });
        console.log(`[JOB STATUS] Звіт ${reportId} в статусі 'PROCESSING'.`);

        // Це ваші тестові дані, в реальності тут буде логіка
        const results = [
            { edrpou: "12345678", accountName: "ТОВ 'Ромашка'", email: "info@romashka.ua", phone: "+380441234567", sgCount: 10, licenseStartDate: new Date("2023-01-15T00:00:00.000Z"), partner: "Partner A", goldPartner: "Yes" },
            { edrpou: "87654321", accountName: "ФОП Іваненко", email: "ivanenko@gmail.com", phone: "+380509876543", sgCount: 2, licenseStartDate: new Date("2024-02-20T00:00:00.000Z"), partner: "Partner B", goldPartner: "No" },
            { edrpou: "11223344", accountName: "ПАТ 'Мрія'", email: "contact@mriya.com", sgCount: 150, licenseStartDate: new Date("2022-11-30T00:00:00.000Z"), partner: "Partner A", goldPartner: "Yes" }
        ];

        let count = 0;
        for (const item of results) {
            await prisma.reportItem.create({
                data: {
                    ...item,
                    reportId: reportId
                }
            });
            count++;
        }

        await delay(10000);

        const downloadUrl = await generateReportCsv(prisma, reportId, SITE_URL);

        if (!downloadUrl) {
            console.warn(`[JOB CSV] generateReportCsv повернула null. CSV не створено.`);
            // (можливо, тут варто кинути помилку, якщо CSV є обов'язковим)
        }

        console.log(`[JOB CSV] Згенеровано лінк: ${downloadUrl}`);

        await prisma.report.update({
            where: { id: reportId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                downloadUrl: downloadUrl // Зберігаємо лінк
            }
        });
        console.log(`[JOB SUCCESS] Звіт ${reportId} готовий.`);


        await fetch(`${SOCKET_SERVER_URL}/job-complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                reportId: reportId,
                data: { downloadUrl: downloadUrl } // Відправляємо лінк
            })
        });
        console.log(`[JOB NOTIFY] Повідомив socket-server про успіх ${reportId}.`);

    } catch (error) {
        // ✅ Типізуємо помилку
        const err = error as Error;
        console.error(`[JOB FAILED] Звіт ${reportId}: ${err.message}`);
        console.error(err); // Повний стектрейс

        await prisma.report.updateMany({
            where: { id: reportId },
            data: {
                status: 'FAILED',
                error: err.message,
                completedAt: new Date()
            }
        });

        await fetch(`${SOCKET_SERVER_URL}/job-failed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                reportId: reportId,
                error: err.message
            })
        });

        throw err; // Важливо "кинути" помилку, щоб BullMQ знав про невдачу
    }
}, { connection: REDIS_CONNECTION });

console.log("✅ Воркер 'report-generation' запущено та слухає чергу...");

worker.on('failed', (job, err) => {
    if (job) {
        console.error(`☠️ Помилка в завданні ${job.id}: ${err.message}`);
    } else {
        console.error(`☠️ Помилка в завданні (job is undefined): ${err.message}`);
    }
});

worker.on('error', err => {
    console.error(`☠️ Критична помилка воркера (напр. Redis): ${err.message}`);
});

