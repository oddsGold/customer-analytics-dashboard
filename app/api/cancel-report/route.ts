import { NextResponse } from 'next/server';
import { getUserSession } from "@/shared/lib/get-user-session";
import { prisma } from "@/prisma/prisma-client";
import { Queue } from 'bullmq';
import { env } from "@/shared/lib/env";

const REDIS_CONNECTION = {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: parseInt(env('REDIS_PORT', '6379'), 10)
};

const reportQueue = new Queue('report-generation', {
    connection: REDIS_CONNECTION
});

export async function POST(req: Request) {
    try {
        const session = await getUserSession();
        const userId = session?.id ? Number(session.id) : null;

        if (!userId) {
            return NextResponse.json({ error: 'Не авторизований' }, { status: 401 });
        }

        const { reportId } = await req.json();

        if (!reportId) {
            return NextResponse.json({ error: 'Відсутній ID звіту' }, { status: 400 });
        }

        const job = await reportQueue.getJob(`report-${reportId}`);

        if (job) {
            if (await job.isWaiting() || await job.isDelayed()) {
                await job.remove();
                console.log(`[Cancel API] Завдання ${reportId} видалено з черги.`);
            }
        }

        await prisma.report.update({
            where: { id: reportId },
            data: {
                status: 'CANCELLED',
                error: 'Скасовано користувачем',
                deletedAt: new Date()
            }
        });

        const SOCKET_SERVER_URL = `${env('SOCKET_HOST', 'http://127.0.0.1')}:${parseInt(env('SOCKET_PORT', '3001'), 10)}`;
        await fetch(`${SOCKET_SERVER_URL}/job-failed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                reportId: reportId,
                error: 'Скасовано користувачем'
            })
        });

        return NextResponse.json({
            message: 'Запит на скасування оброблено.',
            reportId: reportId
        }, { status: 200 });

    } catch (error) {
        console.error("Помилка при скасуванні звіту:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Невідома помилка сервера' }, { status: 500 });
    }
}