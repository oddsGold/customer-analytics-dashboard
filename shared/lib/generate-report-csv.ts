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

        const reportsDir = path.resolve(process.cwd(), 'public', 'reports');
        await fs.mkdir(reportsDir, { recursive: true });

        const filename = `report-${reportId}-${Date.now()}.csv`;
        const filePath = path.join(reportsDir, filename);

        const publicUrl = `/reports/${filename}`;
        // const publicUrl = `${siteUrl}${relativeUrl}`;

        await fs.writeFile(filePath, '\ufeff');

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
            ],

            encoding: 'utf8',
            fieldDelimiter: ';',
            append: true
        });

        const records: CsvRecord[] = items.map((item) => ({
            ...item,
            phone: item.phone ? `="${item.phone}"` : '',
            // Перетворюємо дату в читанний формат, або залишаємо порожнім
            licenseStartDate: item.licenseStartDate
                ? item.licenseStartDate.toISOString().split('T')[0]
                : ''
        }));

        await csvWriter.writeRecords(records);

        return publicUrl;

    } catch (error: unknown) {
        let errorMessage = `CSV Generation Failed for report ${reportId}`;
        if (error instanceof Error) {
            // errorMessage += `: ${error.message}`;
            errorMessage += ``;
        }
        throw new Error(errorMessage);
    }
}
