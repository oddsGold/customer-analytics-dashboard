"use client";

import * as React from "react";
import { Button } from "@/shared/components/ui";
import {ReportState} from "@/shared/store";

export function FormActions({status}: { status: ReportState['status'] }) {

    if (status === 'pending') {
        return (
            <div className="flex items-center space-x-3 p-3 mt-4 border rounded-[5px] bg-muted/50 max-w-sm">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg"
                     fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                            strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold">Звіт генерується...</h3>
                    <p className="text-xs text-muted-foreground">Це може зайняти деякий час. Будь ласка,
                        зачекайте.</p>
                </div>
            </div>
        );
    }

    return (
        <Button type="submit" className="rounded-[5px] mt-4">Сформувати .csv</Button>
    );
}
