"use client"

import { useReportStore } from '@/shared/store';
import {Button} from "@/shared/components/ui";

export function ReportStatusModal() {
    // Читаємо повний стан зі стору
    const { status, successData, error, reset } = useReportStore();

    // Стан помилки
    if (status === 'error') {
        return (
            <div className="modal-overlay">
                <div className="modal-content error-content">
                    <h3>Сталася помилка</h3>
                    <p>На жаль, не вдалося згенерувати звіт:</p>
                    {/* Виводимо текст помилки */}
                    <pre className="error-message">{error}</pre>
                    {/* Кнопка "Закрити", яка скидає стан */}
                    <Button onClick={reset}>
                        Зрозуміло
                    </Button>
                </div>
            </div>
        );
    }

    // Стан успіху
    if (status === 'success' && successData?.downloadUrl) {
        // Припустимо, воркер повернув об'єкт { downloadUrl: '...' }
        // const downloadUrl = successData?.downloadUrl;

        // Або якщо він повернув масив (як у вашому прикладі),
        // ми можемо згенерувати посилання на JSON
        // const dataStr = successData.downloadUrl;
        // const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        return (
            <div className="modal-overlay">
                <div className="modal-content success-content">
                    <h3>Звіт успішно згенеровано!</h3>
                    <p>Ви можете завантажити його прямо зараз.</p>

                    {/* Кнопка "Завантажити" */}
                    <a
                        href={successData.downloadUrl}
                        download // Ім'я файлу
                        className="button button-success" // Стилізуйте як кнопку
                    >
                        Завантажити звіт (JSON)
                    </a>

                    <Button onClick={reset} variant="secondary">
                        Закрити
                    </Button>
                </div>
            </div>
        );
    }

    // 4. 'idle' або будь-який інший стан - нічого не показуємо
    return null;
}