import { Queue } from 'bullmq';
import { NextResponse } from 'next/server';
import {getUserSession} from "@/shared/lib/get-user-session";
import {prisma} from "@/prisma/prisma-client";
import {env} from "@/shared/lib/env";
import {RequestBody} from "@/shared/constants";
import { getReportQueue } from "@/shared/lib/report-queue";

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
            dates,
            options
        } = body as RequestBody;

        const hasStartDate = !!dates?.start?.from || !!dates?.start?.to;
        const hasEndDate = !!dates?.end?.from || !!dates?.end?.to;
        const hasActivationDate = !!dates?.activation?.from || !!dates?.activation?.to;

        if (!hasStartDate && !hasEndDate && !hasActivationDate) {
            return NextResponse.json({ error: "Будь ласка, оберіть 'from' хоча б для одного діапазону." }, { status: 400 });
        }


        const report = await prisma.report.create({
            data: {
                status: 'PENDING',
                userId: userId
            }
        });

        const reportQueue = getReportQueue();

        const job = await reportQueue.add('generate-EDRPOU-report', {
            reportId: report.id,
            userId: userId,
            modules: modules,
            options: options,
            licenseStartDate: dates.start,
            licenseEndDate: dates.end,
            licenseActivationDate: dates.activation
        }, {
            jobId: `report-${report.id}`
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