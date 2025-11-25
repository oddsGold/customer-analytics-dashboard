import {Account, AccountsApiResponse, ClientDetail, RequestBody} from "@/shared/constants";
import {env} from "@/shared/lib/env";

const API_1_URL = env('API_1_URL', 'https://api.medoc.ua/statistics/prro.php');
const API_2_URL = env('API_2_URL', 'https://api.medoc.ua/prro/info/accounts');
const AUTH_TOKEN = env('AUTH_TOKEN');

type Api1Params = Omit<RequestBody, 'reportId' | 'userId'>;

interface PrroApiResponseItem {
    edrpou: string;
    cre_date: string;
    end_date: string;
    dealer_name: string;
    distributor_name: string;
}

interface PrroApiResponse {
    status: string;
    data: PrroApiResponseItem[];
}

async function getEdrpouList(params: Api1Params): Promise<PrroApiResponseItem[]> {
    if (!AUTH_TOKEN) {
        throw new Error('AUTH_TOKEN is missing in environment variables.');
    }

    try {
        const requestBody = {
            dates: params.dates,
            modules: params.modules || [],
            options: params.options
        };

        const headers = {
            'Content-Type': 'application/json',
            'Auth': AUTH_TOKEN || '',
            // 'User-Agent': 'Node.js/BullMQ Worker'
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };

        const response = await fetch(API_1_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });


        if (!response.ok) {
            throw new Error(`API Medoc error: ${response.status} ${response.statusText}`);
        }

        const responseData: PrroApiResponse = await response.json();

        if (responseData.status !== 'ok') {
            throw new Error(`API Medoc returned status: ${responseData.status}`);
        }

        if (!responseData.data || !Array.isArray(responseData.data)) {
            return [];
        }

        return responseData.data;
    } catch (error) {
        console.error("Помилка в getEdrpouList:", error);
        throw error;
    }
}


async function getClientDetail(edrpou: string): Promise<Account | null> {

    if (!AUTH_TOKEN) {
        throw new Error('AUTH_TOKEN is missing in environment variables.');
    }

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Auth': AUTH_TOKEN || '',
            // 'User-Agent': 'Node.js/BullMQ Worker'
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };

        const res = await fetch(API_2_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({ edrpou: edrpou })
        });

        if (!res.ok) {
            console.warn(`[API 2 Warning] Failed for EDRPOU ${edrpou}: ${res.status} ${res.statusText}`);
            return null;
        }

        const responseData: AccountsApiResponse = await res.json();

        if (responseData.status !== 'ok') {
            console.warn(`[API 2 Warning] Status not OK for ${edrpou}: ${responseData.status}`);
            return null;
        }

        if (!responseData.data || !Array.isArray(responseData.data) || responseData.data.length === 0) {
            return null;
        }

        return responseData.data[0];
    } catch (error: any) {
        throw new Error(`[API 2 Error] Exception for EDRPOU ${edrpou}: ${error.message}`);
    }
}


export const ExternalAPI = {
    getEdrpouList,
    getClientDetail
};