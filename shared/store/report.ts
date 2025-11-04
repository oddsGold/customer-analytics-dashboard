import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ReportState {
    status: 'idle' | 'pending' | 'success' | 'error';
    activeReportId: number | null;
    successData: any | null; // Тут будуть дані для завантаження
    error: string | null;

    startReport: (reportId: number) => void;
    setSuccess: (data: any) => void;
    setError: (error: string) => void;
    setActiveReportId: (id: number | null) => void;
    reset: () => void;
}

export const useReportStore = create<ReportState>()(
    persist(
        (set) => ({
            status: 'idle',
            activeReportId: null,
            successData: null,
            error: null,

            setActiveReportId: (id) => set({ activeReportId: id }),

            // Викликається, коли API-запит на /api/reports пройшов успішно
            startReport: (reportId) => set({
                status: 'pending',       // <== Показати лоадер
                activeReportId: reportId,
                successData: null,
                error: null,
            }),

            // Викликається сокет-слухачем при 'report-complete'
            setSuccess: (data) => set({
                status: 'success',       // <== Показати успіх/лінк
                activeReportId: null,    // Звіт більше не "активний"
                successData: data,
            }),

            // Викликається сокет-слухачем при 'report-failed'
            setError: (errorMsg) => set({
                status: 'error',         // <== Показати помилку
                activeReportId: null,    // Звіт більше не "активний"
                error: errorMsg,
            }),

            // Викликається кнопкою "Закрити" на модалці успіху/помилки
            reset: () => set({
                status: 'idle',
                activeReportId: null,
                successData: null,
                error: null,
            }),
        }),
        {
            name: 'report-session-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)