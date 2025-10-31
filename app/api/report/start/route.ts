import { Queue } from 'bullmq';
import { NextResponse } from 'next/server';
import {getUserSession} from "@/shared/lib/get-user-session";
import {prisma} from "@/prisma/prisma-client";


// 1. Підключаємось до черги (вона живе у Redis)
const reportQueue = new Queue('report-generation', {
    connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10)
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
        // Ми очікуємо, що з фронтенду прийде { from: "yyyy-MM-dd", to: "yyyy-MM-dd" | null }
        const { from, to } = body as { from: string, to: string | null };

        // --- 2. Валідація (перевіряємо, чи 'from' існує) ---
        if (!from) {
            return NextResponse.json({ error: 'Дата "З" (from) є обов\'язковою' }, { status: 400 });
        }


        // 2. Створюємо РЕАЛЬНИЙ запис у вашій базі даних
        const report = await prisma.report.create({
            data: {
                status: 'PENDING', // Встановлюємо початковий статус
                userId: userId      // Прив'язуємо до користувача
                // 'completedAt' та 'error' залишаються null
            }
        });

        // 3. Додаємо завдання в чергу з даними, потрібними для роботи
        const job = await reportQueue.add('generate-EDRPOU-report', {
            reportId: report.id, // <-- Тепер це реальний ID з БД (напр. 1, 2, 3)
            userId: userId,
            dateFrom: from, // <-- Передаємо дату воркеру
            dateTo: to
            // ...інші параметри, які може треба передати воркеру
        });

        // 4. МИТТЄВО віддаємо відповідь користувачу
        return NextResponse.json({
            message: "Звіт почав генеруватися.",
            reportId: report.id
        }, { status: 202 }); // "Accepted"

    } catch (error) {
        console.error("Помилка при додаванні завдання в чергу:", error);

        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'Невідома помилка сервера' }, { status: 500 });
    }
}