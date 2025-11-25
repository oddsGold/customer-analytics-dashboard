import {Account, AccountsApiResponse, RequestBody} from "@/shared/constants";
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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
            'User-Agent': 'Node.js/BullMQ Worker'
            // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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


async function getClientDetail(edrpou: string, retries = 2): Promise<Account | null> {
    if (!AUTH_TOKEN) {
        throw new Error('AUTH_TOKEN is missing in environment variables.');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Auth': AUTH_TOKEN || '',
        'User-Agent': 'Node.js/BullMQ Worker'
        // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(API_2_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify({ edrpou: edrpou }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                const responseData: AccountsApiResponse = await res.json();

                if (responseData.status !== 'ok') {
                    console.warn(`[API 2 Warning] Status not OK for ${edrpou}: ${responseData.status}`);
                    return null;
                }

                if (!responseData.data || !Array.isArray(responseData.data) || responseData.data.length === 0) {
                    return null;
                }

                return responseData.data[0];
            }

            if (res.status >= 500 && res.status < 600) {
                console.warn(`[API 2] Attempt ${attempt}/${retries} failed for ${edrpou}: ${res.status}.`);
                if (attempt < retries) {
                    await delay(1000 * attempt); // 1с, 2с...
                    continue;
                }
            }

            console.warn(`[API 2 Warning] Failed for EDRPOU ${edrpou}: ${res.status} ${res.statusText}`);
            return null;

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.error(`[API 2 Timeout] Request for ${edrpou} took too long (>5s). Attempt ${attempt}.`);
            } else {
                console.error(`[API 2 Error] Exception for EDRPOU ${edrpou} (Attempt ${attempt}): ${error.message}`);
            }

            if (attempt < retries) {
                await delay(1000 * attempt);
                continue;
            }

            throw new Error(`API 2 failed for ${edrpou} after ${retries} attempts (Timeout/Network Error).`);
        }
    }

    throw new Error(`API 2 failed completely for ${edrpou}.`);
}

export const ExternalAPI = {
    getEdrpouList,
    getClientDetail
};