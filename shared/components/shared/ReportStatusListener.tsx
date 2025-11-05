"use client"

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useReportStore } from '@/shared/store';
import {ReportSuccessData} from "@/shared/constants";


const SOCKET_HOST = process.env.SOCKET_HOST || 'http://127.0.0.1';
const SOCKET_PORT = process.env.SOCKET_PORT || '3001';
const SOCKET_URL = `${SOCKET_HOST}:${SOCKET_PORT}` || 'http://127.0.0.1:3001';

interface ReportStatusListenerProps {
    userId: number;
}

interface SocketCompletePayload {
    reportId: number;
    data: ReportSuccessData;
}

interface SocketFailedPayload {
    reportId: number;
    error: string;
}

export function ReportStatusListener({ userId }: ReportStatusListenerProps) {
    const { activeReportId, setSuccess, setError } = useReportStore();

    useEffect(() => {
        if (!activeReportId || !userId) {
            return;
        }

        const socket: Socket = io(SOCKET_URL);

        socket.on('connect', () => {
            socket.emit('subscribe', userId);
        });

        socket.on('report-complete', (data: SocketCompletePayload) => {
            console.log('Отримано:', data);

            if (data.reportId === activeReportId) {
                setSuccess(data.data);
            }
        });

        socket.on('report-failed', (data: SocketFailedPayload) => {
            if (data.reportId === activeReportId) {
                setError(data.error);
            }
        });

        return () => {
            socket.disconnect();
        };

    }, [activeReportId, userId, setSuccess, setError]);

    return null;
}