import {instance} from "./instance";
import {ApiRoutes} from "@/shared/services/constants";
import {ReportParams, ReportStartResponse} from "@/shared/constants";

export const startReport = async (params: ReportParams): Promise<ReportStartResponse> => {

    const { data } = await instance.post<ReportStartResponse>(
        ApiRoutes.SEARCH_CLIENTS,
        params
    );

    return data;
};

export const cancelReport = async (reportId: number): Promise<ReportStartResponse> => {
    const { data } = await instance.post<ReportStartResponse>(
        ApiRoutes.CANCEL_REPORT,
        { reportId }
    )

    return data;
};