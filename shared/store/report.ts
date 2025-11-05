import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface ReportState {
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

            startReport: (reportId) => set({
                status: 'pending',
                activeReportId: reportId,
                successData: null,
                error: null,
            }),

            setSuccess: (data) => set({
                status: 'success',
                activeReportId: null,
                successData: data,
            }),

            setError: (errorMsg) => set({
                status: 'error',
                activeReportId: null,
                error: errorMsg,
            }),

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