import { Queue } from 'bullmq';
import { NextResponse } from 'next/server';
import {getUserSession} from "@/shared/lib/get-user-session";
import {prisma} from "@/prisma/prisma-client";
import {env} from "@/shared/lib/env";
import {RequestBody} from "@/shared/constants";


const REDIS_CONNECTION = {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: parseInt(env('REDIS_PORT', '6379'), 10)
};

const reportQueue = new Queue('report-generation', {
    connection: REDIS_CONNECTION,

    defaultJobOptions: {
        attempts: parseInt(env('BULLMQ_JOB_ATTEMPTS', '3'), 10) || 3,
        backoff: {
            type: 'exponential',
            delay: 10000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    }
});

export async function POST(req: Request) {
    try {
        const session = await getUserSession();
        const userId = session?.id ? Number(session.id) : null;

        if (!userId) {
            return NextResponse.json({ error: 'Не авторизований' }, { status: 401 });
        }

        const body = await req.json();
        const {
            modules,
            licenseStartDate,
            licenseEndDate,
            licenseActivationDate
        } = body as RequestBody;

        const hasStartDate = !!licenseStartDate?.from;
        const hasEndDate = !!licenseEndDate?.from;
        const hasActivationDate = !!licenseActivationDate?.from;

        if (!hasStartDate && !hasEndDate && !hasActivationDate) {
            return NextResponse.json({ error: "Будь ласка, оберіть 'from' хоча б для одного діапазону." }, { status: 400 });
        }


        const report = await prisma.report.create({
            data: {
                status: 'PENDING',
                userId: userId
            }
        });

        const job = await reportQueue.add('generate-EDRPOU-report', {
            reportId: report.id,
            userId: userId,
            modules: modules,
            licenseStartDate: licenseStartDate,
            licenseEndDate: licenseEndDate,
            licenseActivationDate: licenseActivationDate
        });

        return NextResponse.json({
            message: "Звіт почав генеруватися.",
            reportId: report.id
        }, { status: 202 });

    } catch (error) {
        console.error("Помилка при додаванні завдання в чергу:", error);

        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'Невідома помилка сервера' }, { status: 500 });
    }
}