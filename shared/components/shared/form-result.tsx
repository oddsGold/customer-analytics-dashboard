"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";
import {useReportStore} from "@/shared/store";


export function FormResult() {
    const [isDownloading, setIsDownloading] = React.useState(false);
    const { status, successData, error, reset } = useReportStore();

    const handleDownloadClick = async () => {
        if (!successData?.downloadUrl || isDownloading) return;

        setIsDownloading(true);
        try {
            const response = await fetch(successData.downloadUrl);
            if (!response.ok) throw new Error('Не вдалося завантажити файл');

            const fileBlob = await response.blob();
            if (fileBlob.size === 0) throw new Error('Файл порожній');

            const blobUrl = window.URL.createObjectURL(fileBlob);
            const link = document.createElement('a');
            link.href = blobUrl;
            const filename = successData.downloadUrl.split('/').pop() || 'report.csv';
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err: any) {
            console.error('Помилка завантаження:', err);
            toast.error(err.message || 'Не вдалося завантажити файл.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (status === 'error') {
        return (
            <div
                className="relative p-4 pr-10 border rounded-[5px] bg-destructive/10 border-destructive/50 text-destructive-foreground max-w-sm">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="absolute top-2 right-2 p-1 h-auto text-destructive-foreground hover:bg-destructive/20"
                    aria-label="Закрити"
                >
                    <X className="h-4 w-4 text-red-300" />
                </Button>
                <h3 className="font-semibold text-red-300">Сталася помилка</h3>
                <p className="text-sm text-red-300">На жаль, не вдалося згенерувати звіт:</p>
                <p
                    className="text-xs my-2 p-2 bg-destructive/20 rounded font-mono">{error || 'Невідома помилка'}</p>
            </div>
        );
    }

    if (status === 'success' && successData?.downloadUrl) {
        return (
            <div className="relative p-4 pr-10 border rounded-[5px] bg-green-100 border-green-300 text-green-900 max-w-sm">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="absolute top-2 right-2 p-1 h-auto text-green-900 hover:bg-green-200"
                    aria-label="Закрити"
                >
                    <X className="h-4 w-4" />
                </Button>

                <h3 className="font-semibold">Звіт успішно згенеровано!</h3>
                <p className="text-sm">Ви можете завантажити його прямо зараз.</p>

                <Button
                    type="button"
                    disabled={isDownloading}
                    onClick={handleDownloadClick}
                    className={cn(
                        "bg-green-600 text-white rounded-[5px] hover:bg-green-700 mt-2"
                    )}
                >
                    {isDownloading ? 'Завантаження...' : 'Завантажити звіт'}
                </Button>
            </div>
        );
    }

    return null;
}
