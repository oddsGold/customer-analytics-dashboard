export interface ReportParams {
    from: string;
    to: string | null;
    modules?: string[];
}

export interface ReportStartResponse {
    message: string;
    reportId: number;
}

export interface ReportSuccessData {
    downloadUrl: string;
}

export interface ReportJobData {
    reportId: number;
    userId: number;
    dateFrom: string;
    dateTo: string | null;
    modules?: string[];
}

export interface ClientDetail {
    edrpou: string;
    accountName: string | null;
    email: string | null;
    phone: string | null;
    sgCount: number | null;
    licenseStartDate: Date | null;
    partner: string | null;
    goldPartner: string | null;
}