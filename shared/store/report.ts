import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {ReportSuccessData} from "@/shared/constants";

export interface ReportState {
    status: 'idle' | 'pending' | 'success' | 'error';
    progress: number;
    activeReportId: number | null;
    successData: ReportSuccessData | null;
    error: string | null;

    startReport: (reportId: number) => void;
    setProgress: (progress: number) => void;
    setSuccess: (data: ReportSuccessData) => void;
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
            progress: 0,

            setActiveReportId: (id) => set({ activeReportId: id }),

            startReport: (reportId) => set({
                status: 'pending',
                activeReportId: reportId,
                progress: 0,
                successData: null,
                error: null,
            }),

            setProgress: (progress) => set((state) => ({
                ...state,
                status: state.status === 'pending' ? 'pending' : state.status,
                progress: progress,
            })),

            setSuccess: (data) => set({
                status: 'success',
                activeReportId: null,
                successData: data,
                progress: 100,
            }),

            setError: (errorMsg) => set({
                status: 'error',
                activeReportId: null,
                error: errorMsg,
                progress: 0,
            }),

            reset: () => set({
                status: 'idle',
                activeReportId: null,
                successData: null,
                error: null,
                progress: 0,
            }),
        }),
        {
            name: 'report-session-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)