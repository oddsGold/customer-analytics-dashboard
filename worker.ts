import { Worker, Job, UnrecoverableError } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { env } from './shared/lib/env';
import {Account, DateRangePayload} from "@/shared/constants";
import { ExternalAPI } from "@/shared/services/external-api-service";
import { generateReportXlsx } from "@/shared/lib/generate-report-xlsx";

const prisma = new PrismaClient();

const CONNECTION_CONFIG = {
    connection: {
        host: env('REDIS_HOST', '127.0.0.1'),
        port: parseInt(env('REDIS_PORT', '6379'), 10)
    }
};

const SOCKET_API = `${env('SOCKET_HOST', 'http://127.0.0.1')}:${env('SOCKET_PORT', '3001')}`;
const SITE_URL = env('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');

const CANCELLATION_ERROR = "JOB_CANCELLED_BY_STATUS";
const MAX_CONSECUTIVE_ERRORS = 5;
const REQUEST_DELAY_MS = 200;

interface JobPayload {
    reportId: number;
    userId: number;
    modules?: string[];
    options?: { unique: boolean; new: boolean };
    licenseStartDate?: DateRangePayload | null;
    licenseEndDate?: DateRangePayload | null;
    licenseActivationDate?: DateRangePayload | null;
}


async function sendProgress(reportId: number, userId: number, progress: number) {
    try {
        await fetch(`${SOCKET_API}/job-progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                reportId,
                progress: Math.min(Math.max(progress, 0), 100)
            })
        });
    } catch (err: any) {
        console.error(`[Socket Progress Error] Report ${reportId}: ${err.message}`);
    }
}

async function checkCancellation(reportId: number) {
    const report = await prisma.report.findUnique({
        where: { id: reportId },
        select: { status: true }
    });

    if (report?.status === 'CANCELLED') {
        throw new Error(CANCELLATION_ERROR);
    }
}

async function cleanupReportData(reportId: number) {
    try {
        await prisma.reportItem.deleteMany({ where: { reportId } });
        console.log(`[Cleanup] Data deleted for report ${reportId}`);
    } catch (err: any) {
        console.error(`[Cleanup Error] Report ${reportId}: ${err.message}`);
    }
}


const worker = new Worker<JobPayload>('report-generation', async (job) => {
    const {
        reportId,
        userId,
        modules,
        options,
        licenseStartDate,
        licenseEndDate,
        licenseActivationDate
    } = job.data;

    if (!reportId || !userId) {
        throw new Error("Missing reportId or userId in job data");
    }

    try {
        await checkCancellation(reportId);
        await prisma.report.update({ where: { id: reportId }, data: { status: 'PROCESSING' } });
        await sendProgress(reportId, userId, 5);

        await prisma.reportItem.deleteMany({ where: { reportId } });
        await sendProgress(reportId, userId, 10);

        const paramsForApi1 = {
            modules,
            options: options || { unique: false, new: false },
            dates: {
                start: licenseStartDate ?? { from: null, to: null },
                end: licenseEndDate ?? { from: null, to: null },
                activation: licenseActivationDate ?? { from: null, to: null }
            }
        };

        const edrpouList = await ExternalAPI.getEdrpouList(paramsForApi1);

        if (!edrpouList || edrpouList.length === 0) {
            throw new Error("Не знайдено жодного клієнта за вказаними критеріями.");
        }

        await sendProgress(reportId, userId, 15);

        const totalItems = edrpouList.length;
        let consecutiveErrors = 0;

        for (let index = 0; index < totalItems; index++) {
            if (index % 5 === 0) await checkCancellation(reportId);

            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                throw new Error(`Звіт зупинено: Зовнішній сервіс не відповідає (${MAX_CONSECUTIVE_ERRORS} помилок поспіль).`);
            }

            const clientItem = edrpouList[index];
            const edrpou = clientItem.edrpou;

            let itemDetails: Account | null = null;

            try {
                itemDetails = await ExternalAPI.getClientDetail(edrpou);


                consecutiveErrors = 0;

                await prisma.reportItem.create({
                    data: {
                        reportId: reportId,
                        edrpou: edrpou,
                        accountName: itemDetails?.full_name ?? null,
                        email: itemDetails?.email ?? null,
                        phone: itemDetails?.phone ?? null,
                        sgCount: itemDetails?.attached_entity_count ?? null,
                        partner: clientItem.dealer_name ?? null,
                        goldPartner: clientItem.distributor_name ?? null,
                        licenseStartDate: clientItem.cre_date ? new Date(clientItem.cre_date) : null,
                    }
                });

            } catch (err: any) {
                console.warn(`[Worker Warning] Failed client ${edrpou}: ${err.message}`);
                consecutiveErrors++;
            }

            const progress = 15 + Math.round(((index + 1) / totalItems) * 75);
            await sendProgress(reportId, userId, progress);

            if (REQUEST_DELAY_MS > 0) {
                await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
            }
        }

        const downloadUrl = await generateReportXlsx(prisma, reportId, SITE_URL);
        await sendProgress(reportId, userId, 95);

        if (!downloadUrl) {
            throw new Error(`Не вдалося згенерувати файл звіту ${reportId}.`);
        }

        await checkCancellation(reportId);

        await prisma.report.update({
            where: { id: reportId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                downloadUrl: downloadUrl
            }
        });

        await fetch(`${SOCKET_API}/job-complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                reportId,
                data: { downloadUrl }
            })
        });

        await prisma.reportItem.deleteMany({ where: { reportId } });

    } catch (error) {
        throw error;
    }
}, CONNECTION_CONFIG);


worker.on('failed', async (job, err) => {
    if (!job) {
        console.error(`[Worker Error] Job failed without instance: ${err.message}`);
        return;
    }

    const { reportId, userId } = job.data as JobPayload;

    if (err.message === CANCELLATION_ERROR) {
        console.log(`[Worker] Job ${reportId} cancelled by user.`);
        await cleanupReportData(reportId);
        await job.remove();
        return;
    }

    if (err instanceof UnrecoverableError) {
        console.error(`☠️ [JOB FAILED FATAL] Report ${reportId}. Cause: ${err.message}`);

        await prisma.report.updateMany({
            where: { id: reportId },
            data: {
                status: 'FAILED',
                error: err.message,
                completedAt: new Date()
            }
        });

        await fetch(`${SOCKET_API}/job-failed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, reportId, error: err.message })
        });
        return;
    }

    console.error(`[Worker Error] Job ${reportId} failed: ${err.message}`);

    const maxAttempts = job.opts.attempts || 3;
    const isFinalAttempt = job.attemptsMade >= maxAttempts;

    if (isFinalAttempt) {
        console.error(`☠️ [JOB FAILED FINAL] Report ${reportId}. Cause: ${err.message}`);

        await prisma.report.updateMany({
            where: { id: reportId },
            data: {
                status: 'FAILED',
                error: err.message,
                completedAt: new Date()
            }
        });

        await fetch(`${SOCKET_API}/job-failed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                reportId,
                error: err.message
            })
        });
    } else {
        console.log(`⏳ [JOB RETRY] Report ${reportId} will retry. Attempt ${job.attemptsMade}/${maxAttempts}`);
    }
});

worker.on('error', err => {
    console.error(`☠️ [System Error] Worker connection failed: ${err.message}`);
});