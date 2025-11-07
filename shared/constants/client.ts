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

export interface DateRangePayload {
    from: string;
    to: string | null;
}

export interface RequestBody {
    modules?: string[];
    licenseStartDate?: DateRangePayload | null;
    licenseEndDate?: DateRangePayload | null;
    licenseActivationDate?: DateRangePayload | null;
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

export interface Module {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    authorId: number;
    isPublished: boolean;
    moduleId: number;
    categoryId: number;
}

export interface CategoryWithModules {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    authorId: number;
    modules: Module[];
}