import ExcelJS from 'exceljs';
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

export async function generateReportXlsx(
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

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Звіт');

        worksheet.columns = [
            { header: 'ЄДРПОУ', key: 'edrpou', width: 15 },
            { header: 'Назва акаунту', key: 'accountName', width: 35 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Телефон', key: 'phone', width: 15 },
            { header: 'К-сть кас', key: 'sgCount', width: 10 },
            { header: 'Початок ліцензії', key: 'licenseStartDate', width: 15 },
            { header: 'Партнер', key: 'partner', width: 25 },
            { header: 'Голд-партнер', key: 'goldPartner', width: 25 },
        ];

        items.forEach((item) => {
            worksheet.addRow({
                edrpou: item.edrpou,
                accountName: item.accountName,
                email: item.email,
                phone: item.phone,
                sgCount: item.sgCount,
                licenseStartDate: item.licenseStartDate ? item.licenseStartDate.toISOString().split('T')[0] : '',
                partner: item.partner,
                goldPartner: item.goldPartner
            });
        });

        worksheet.views = [
            { state: 'frozen', ySplit: 1 }
        ];

        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDDEBF7' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 30;

        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell!({ includeEmpty: true }, function(cell) {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(maxLength + 2, 50);
        });

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                cell.alignment = { vertical: 'middle', wrapText: true };
            });
        });

        worksheet.getColumn('A').numFmt = '@';

        worksheet.getRow(1).font = { bold: true };

        const reportsDir = path.resolve(process.cwd(), 'public', 'reports');
        await fs.mkdir(reportsDir, { recursive: true });

        const filename = `report-${reportId}-${Date.now()}.xlsx`;
        const filePath = path.join(reportsDir, filename);

        await workbook.xlsx.writeFile(filePath);

        return `/reports/${filename}`;

    } catch (error: unknown) {
        let errorMessage = `CSV Generation Failed for report ${reportId}`;
        if (error instanceof Error) {
            // errorMessage += `: ${error.message}`;
            errorMessage += ``;
        }
        throw new Error(errorMessage);
    }
}
