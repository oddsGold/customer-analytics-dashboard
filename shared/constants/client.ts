export interface ReportParams {
    licenseStartDate?: DateRangePayload | null;
    licenseEndDate?: DateRangePayload | null;
    licenseActivationDate?: DateRangePayload | null;
    modules?: string[];
    parameter?: string | null;
}

export interface ReportStartResponse {
    message: string;
    reportId: number;
}

export interface ReportSuccessData {
    downloadUrl: string;
}

export interface DateRangePayload {
    from: string | null;
    to: string | null;
}

export interface RequestBody {
    modules?: string[];
    options?: {
        unique: boolean,
        new: boolean
    }
    dates: {
        start: DateRangePayload;
        end: DateRangePayload;
        activation: DateRangePayload;
    };
}

export interface ClientDetail {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    attached_entity_count: number | null;

    // licenseStartDate: Date | null;
    // partner: string | null;
    // goldPartner: string | null;
}

export interface Account {
    full_name: string;
    email: string;
    phone: string;
    attached_entity_count: number;
    role: string;
    type: 'cashalot' | 'sota_kasa';
    edr_status: string | null;
}

export interface AccountsApiResponse {
    status: string;
    data: Account[];
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

export interface JobPayload {
    reportId: number;
    userId: number;
    modules?: string[];
    options?: { unique: boolean; new: boolean };
    licenseStartDate?: DateRangePayload | null;
    licenseEndDate?: DateRangePayload | null;
    licenseActivationDate?: DateRangePayload | null;
}