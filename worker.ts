import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { generateReportCsv } from "./shared/lib/generate-report-csv";
import { env } from './shared/lib/env';
import {ClientDetail, ReportJobData} from "@/shared/constants";
import {ExternalAPI} from "@/shared/services/external-api-service";

const prisma = new PrismaClient();

const REDIS_CONNECTION = {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: parseInt(env('REDIS_PORT', '6379'), 10)
};
const SOCKET_HOST = env('SOCKET_HOST', 'http://127.0.0.1');
const SOCKET_PORT = parseInt(env('SOCKET_PORT', '3001'), 10);
const SOCKET_SERVER_URL = `${SOCKET_HOST}:${SOCKET_PORT}`;
const SITE_URL = env('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');


async function sendProgress(reportId: number, userId: number, progress: number) {
    const finalProgress = Math.min(Math.max(progress, 0), 100);

    try {
        await fetch(`${SOCKET_SERVER_URL}/job-progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                reportId: reportId,
                progress: finalProgress
            })
        });
    } catch (err: any) {
        console.error(`[Socket Progress Error] Не вдалося відправити прогрес для ${reportId}: ${err.message}`);
    }
}


const worker = new Worker('report-generation', async (job) => {
    const { reportId, userId, dateFrom, dateTo, modules } = job.data as ReportJobData;

    if (!reportId || !userId) {
        throw new Error("Missing reportId or userId in job data");
    }

    try {
        await prisma.report.update({
            where: { id: reportId },
            data: { status: 'PROCESSING' }
        });
        await sendProgress(reportId, userId, 5);

        await prisma.reportItem.deleteMany({
            where: {
                reportId: reportId
            }
        });
        await sendProgress(reportId, userId, 10);

        const paramsForApi1 = { dateFrom, dateTo, modules };
        const edrpouList = await ExternalAPI.getEdrpouList(paramsForApi1);

        if (edrpouList.length === 0) {
            throw new Error("Не знайдено жодного клієнта за вказаними критеріями.");
        }

        await sendProgress(reportId, userId, 15);

        let count = 0;
        const totalItems = edrpouList.length;
        const progressStart = 15;
        const progressRange = 75;

        if (totalItems > 0) {
            for (let index = 0; index < totalItems; index++) {
                const edrpou = edrpouList[index];

                const item: ClientDetail | null = await ExternalAPI.getClientDetail(edrpou);

                if (item) {
                    await prisma.reportItem.create({
                        data: {
                            ...item,
                            licenseStartDate: item.licenseStartDate ? new Date(item.licenseStartDate) : null,
                            reportId: reportId
                        }
                    });
                    count++;
                } else {
                    console.log(`[JOB DATA] Пропущено EDRPOU ${edrpou} (немає даних).`);
                }

                const progress = progressStart + Math.round(((index + 1) / totalItems) * progressRange);

                await sendProgress(reportId, userId, progress);
            }
        }

        const downloadUrl = await generateReportCsv(prisma, reportId, SITE_URL);
        await sendProgress(reportId, userId, 95);

        if (!downloadUrl && count > 0) {
            throw new Error(`CSV не створено, generateReportCsv повернула null (але дані були). Звіт ${reportId}.`);
        }

        await prisma.report.update({
            where: { id: reportId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                downloadUrl: downloadUrl
            }
        });

        await fetch(`${SOCKET_SERVER_URL}/job-complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                reportId: reportId,
                data: { downloadUrl: downloadUrl }
            })
        });

        const deleteResult = await prisma.reportItem.deleteMany({
            where: {
                reportId: reportId
            }
        });

    } catch (error) {
        const err = error as Error;

        throw err;
    }
}, { connection: REDIS_CONNECTION });

worker.on('failed', async (job: Job | undefined, err: Error) => {
    if (!job) {
        console.error(`Помилка в завданні (job is undefined): ${err.message}`);
        return;
    }

    const { reportId, userId } = job.data as ReportJobData;

    const maxAttempts = job.opts.attempts || 3;
    const isFinalAttempt = job.attemptsMade >= maxAttempts;


    if (isFinalAttempt) {
        console.error(`☠️ [JOB FAILED FINAL] Завдання ${job.id} (Звіт ${reportId}) остаточно провалено після ${job.attemptsMade} спроб: ${err.message}`);

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
    } else {
        console.log(`⏳ [JOB RETRY] Завдання ${job.id} буде повторено через деякий час. Спроба ${job.attemptsMade}/${maxAttempts}`);
    }
});

worker.on('error', err => {
    console.error(`☠️ Критична помилка воркера (напр. Redis): ${err.message}`);
});