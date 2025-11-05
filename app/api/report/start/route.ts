import { Queue } from 'bullmq';
import { NextResponse } from 'next/server';
import {getUserSession} from "@/shared/lib/get-user-session";
import {prisma} from "@/prisma/prisma-client";
import {env} from "@/shared/lib/env";


const REDIS_CONNECTION = {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: parseInt(env('REDIS_PORT', '6379'), 10)
};

// Створюємо чергу (Queue) З НАЛАШТУВАННЯМИ "RETRIES"
const reportQueue = new Queue('report-generation', {
    connection: REDIS_CONNECTION,

    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 10000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    }
});

interface RequestBody {
    from: string;
    to: string | null;
    modules?: string[];
}

export async function POST(req: Request) {
    try {
        const session = await getUserSession();
        const userId = session?.id ? Number(session.id) : null;

        if (!userId) {
            return NextResponse.json({ error: 'Не авторизований' }, { status: 401 });
        }

        const body = await req.json();
        const { from, to, modules } = body as RequestBody;

        if (!from) {
            return NextResponse.json({ error: 'Дата "З" є обов\'язковою' }, { status: 400 });
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
            dateFrom: from,
            dateTo: to,
            modules: modules
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