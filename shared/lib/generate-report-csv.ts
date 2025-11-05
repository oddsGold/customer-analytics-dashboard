import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import { promises as fs } from 'fs';
import { PrismaClient } from '@prisma/client';

interface ReportItemData {
    edrpou: string;
    accountName: string | null;
    email: string | null;
    phone: string | null;
    sgCount: number | null;
    licenseStartDate: Date | null;
    partner: string | null;
    goldPartner: string | null;
}

interface CsvRecord {
    edrpou: string;
    accountName: string | null;
    email: string | null;
    phone: string | null;
    sgCount: number | null;
    licenseStartDate: string;
    partner: string | null;
    goldPartner: string | null;
}

export async function generateReportCsv(
    prisma: PrismaClient,
    reportId: number,
    siteUrl: string
): Promise<string | null> {

    try {
        // 1. Отримуємо всі ReportItem для цього звіту
        const items: ReportItemData[] = await prisma.reportItem.findMany({
            where: { reportId: reportId },
            select: {
                edrpou: true,
                accountName: true,
                email: true,
                phone: true,
                sgCount: true,
                licenseStartDate: true,
                partner: true,
                goldPartner: true
            }
        });

        if (items.length === 0) {
            console.warn(`[CSV] Не знайдено даних для звіту ${reportId}. CSV не створено.`);
            return null;
        }

        // 2. Визначаємо шлях та назву файлу
        const reportsDir = path.resolve(process.cwd(), 'public', 'reports');
        await fs.mkdir(reportsDir, { recursive: true });

        const filename = `report-${reportId}-${Date.now()}.csv`;
        const filePath = path.join(reportsDir, filename);

        // 3. Визначаємо публічний URL (який побачить клієнт)
        const relativeUrl = `/reports/${filename}`;
        const publicUrl = `${siteUrl}${relativeUrl}`;

        // 4. Налаштовуємо заголовки CSV
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'edrpou', title: 'EDRPOU' },
                { id: 'accountName', title: 'Account Name' },
                { id: 'email', title: 'Email' },
                { id: 'phone', title: 'Phone' },
                { id: 'sgCount', title: 'SG Count' },
                { id: 'licenseStartDate', title: 'License Start Date' },
                { id: 'partner', title: 'Partner' },
                { id: 'goldPartner', title: 'Gold Partner' }
            ]
        });

        // 5. Форматуємо дати (csv-writer очікує рядки)
        const records: CsvRecord[] = items.map((item) => ({
            ...item,
            // Перетворюємо дату в читанний формат, або залишаємо порожнім
            licenseStartDate: item.licenseStartDate
                ? item.licenseStartDate.toISOString().split('T')[0]
                : ''
        }));

        // 6. Записуємо дані у файл
        await csvWriter.writeRecords(records);

        console.log(`[CSV] Файл успішно створено: ${filePath}`);

        // 7. Повертаємо публічний лінк
        return publicUrl;

    } catch (error: unknown) {
        let errorMessage = `CSV Generation Failed for report ${reportId}`;
        if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
        }
        console.error(`[CSV] Помилка генерації CSV:`, error);
        throw new Error(errorMessage);
    }
}
