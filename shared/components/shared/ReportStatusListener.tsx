"use client"

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useReportStore } from '@/shared/store';

// URL нашого Socket-сервера
const SOCKET_URL = 'http://127.0.0.1:3001';

// 1. Створюємо інтерфейс для пропсів
interface ReportStatusListenerProps {
    userId: number; // Ми очікуємо ID користувача
}

export function ReportStatusListener({ userId }: ReportStatusListenerProps) {
    // 1. Дістаємо ID звіту зі стору
    const { activeReportId, setSuccess, setError } = useReportStore();

    // 2. ID користувача (userId) ми тепер отримуємо з пропсів!
    //    Більше ніяких заглушок.

    useEffect(() => {
        // Якщо нема активного звіту або ID юзера, нічого не робимо
        if (!activeReportId || !userId) {
            return;
        }

        // 3. Підключаємось до Socket.IO
        const socket: Socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Підключено до Socket.IO. Підписуюсь...');
            // 4. Кажемо серверу, хто ми (використовуючи ID з пропсів)
            socket.emit('subscribe', userId);
        });

        // 5. Слухаємо подію УСПІХУ
        socket.on('report-complete', (data: { reportId: number, data: any[] }) => {
            console.log('Отримано report-complete:', data);

            if (data.reportId === activeReportId) {
                setSuccess(data.data);

                // TODO: Зробіть щось з даними (data.data)
            }
        });

        // 6. Слухаємо подію ПОМИЛКИ
        socket.on('report-failed', (data: { reportId: number, error: string }) => {
            if (data.reportId === activeReportId) {
                setError(data.error);
            }
        });

        // 7. Прибираємо за собою
        return () => {
            console.log('Відключення від Socket.IO');
            socket.disconnect();
        };

    }, [activeReportId, userId, setSuccess, setError]); // Ефект спрацює, коли з'явиться ID

    return null; // Цей компонент нічого не рендерить
}