
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API 1: Отримуємо список EDRPOU ---
// (Вам потрібно буде замінити 'YOUR_API_1_URL' та додати 'Authorization' хедep)
import {ClientDetail, ReportJobData} from "@/shared/constants";

const API_1_URL = 'https://api.service1.com/get-edrpou-list';

// (Припускаємо, що API 1 приймає ті ж параметри, що й воркер)
type Api1Params = Omit<ReportJobData, 'reportId' | 'userId'>;

async function getEdrpouList(params: Api1Params): Promise<string[]> {
    try {
        // const response = await fetch(API_1_URL, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         // 'Authorization': `Bearer ${env('API_1_KEY')}`
        //     },
        //     body: JSON.stringify(params)
        // });
        //
        // if (!response.ok) {
        //     throw new Error(`API 1 (EDRPOU) error: ${response.statusText}`);
        // }
        //
        // const data = await response.json();
        // // Припускаємо, що він повертає { edrpou_list: ['111', '222'] }
        // return data.edrpou_list || [];

        await delay(2000); // Імітуємо затримку API
        return ["12345678", "87654321", "11223344"];

    } catch (error) {
        console.error("Помилка в getEdrpouList:", error);
        throw error;
    }
}


// --- API 2: Отримуємо деталі по EDRPOU ---
// (Вам потрібно буде замінити 'YOUR_API_2_URL')
const API_2_URL = 'https://api.service2.com/get-client-details';

async function getClientDetails(edrpouList: string[]): Promise<ClientDetail[]> {
    try {
        // const response = await fetch(API_2_URL, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         // 'Authorization': `Bearer ${env('API_2_KEY')}`
        //     },
        //     body: JSON.stringify({ edrpou_codes: edrpouList }) // Припускаємо, API 2 приймає такий формат
        // });
        //
        // if (!response.ok) {
        //     throw new Error(`API 2 (Details) error: ${response.statusText}`);
        // }
        //
        // const data = await response.json();
        // // Припускаємо, що він повертає { results: [...] }
        // return data.results || [];

        await delay(2000); // Імітуємо затримку API
        return [
            { edrpou: "12345678", accountName: "ТОВ 'Ромашка'", email: "info@romashka.ua", phone: "+380441234567", sgCount: 10, licenseStartDate: new Date("2023-01-15T00:00:00.000Z"), partner: "Partner A", goldPartner: "Yes" },
            { edrpou: "87654321", accountName: "ФОП Іваненко", email: "ivanenko@gmail.com", phone: "+380509876543", sgCount: 2, licenseStartDate: new Date("2024-02-20T00:00:00.000Z"), partner: "Partner B", goldPartner: "No" },
            { edrpou: "11223344", accountName: "ПАТ 'Мрія!'", email: "contact@mriya.com", phone: null, sgCount: 150, licenseStartDate: new Date("2022-11-30T00:00:00.000Z"), partner: "Partner A", goldPartner: "Yes" }
        ];

    } catch (error) {
        console.error("Помилка в getClientDetails:", error);
        throw error;
    }
}


// Експортуємо наш сервіс
export const ExternalAPI = {
    getEdrpouList,
    getClientDetails
};