"use client";

import * as React from "react";
import {Button, Progress} from "@/shared/components/ui";
import { useReportStore, ReportState } from "@/shared/store";

export function FormActions({ status }: { status: ReportState['status'] }) {
    const progress = useReportStore((state) => state.progress);

    if (status === 'pending') {
        return (
            <div className="flex flex-col space-y-3 p-3 border rounded-[5px] mt-4 bg-muted/50 max-w-sm">

                <div className="flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="flex flex-col">
                        <h3 className="text-sm font-semibold">Звіт генерується... ({progress}%)</h3>
                    </div>
                </div>

                <Progress value={progress} className="h-2 rounded-[5px]" />

                <p className="text-xs text-muted-foreground">
                    Це може зайняти деякий час. Будь ласка, зачекайте.
                </p>
            </div>
        );
    }
    return (
        <Button type="submit" className="rounded-[5px] mt-4">Сформувати .csv</Button>
    );
}