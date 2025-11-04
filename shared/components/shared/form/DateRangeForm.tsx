"use client";

import * as React from "react"
import { format } from "date-fns"
import {Calendar as CalendarIcon, X} from "lucide-react"
import { DateRange } from "react-day-picker"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import toast from "react-hot-toast"
import {cn} from "@/shared/lib/utils";
import {
    Button,
    FormField,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Form,
    FormItem,
    FormLabel, FormMessage, FormControl, Checkbox
} from "@/shared/components/ui";
import {Calendar} from "@/shared/components/ui/calendar";
import { uk } from "date-fns/locale"
import {useReportStore} from "@/shared/store";

const modules = [
    { id: "1", label: "каса Cashalot (ID 1)" },
    { id: "2", label: "FSAPI (ID 2)" },
    { id: "3", label: "COM/ApiBridge (ID 3)" },
    { id: "4", label: "драйвер BAS (ID 4)" },
    { id: "5", label: "каса + драйвер COM/ApiBridge (ID 5)" },
    { id: "6", label: "каса + драйвер BAS (ID 6)" },
    { id: "101", label: "Cклад (ID 101)" },
];

const FormSchema = z.object({
    dateRange: z.object(
        {
            from: z.date({ required_error: "Дата 'З' є обов'язковою." }),
            to: z.date().optional(), // 'По' може бути необов'язковим
        },
        { required_error: "Будь ласка, оберіть діапазон дат." }
    ),
    modules: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof FormSchema>;

export function DateRangeForm() {
    // Стан для керування Popover (щоб він закривався після вибору)
    const [open, setOpen] = React.useState(false);
    const {status, startReport, successData, error, reset} = useReportStore()
    console.log(status);
    const [isDownloading, setIsDownloading] = React.useState(false)
    // 2. Ініціалізуємо react-hook-form
    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            dateRange: {
                from: undefined,
                to: undefined,
            },
            modules: [],
        },
    })

    const setActiveReportId = useReportStore((state) => state.setActiveReportId);

    // 3. Обробник відправки форми
    async function onSubmit(data: FormValues) {
        try {
            const response = await fetch('/api/report/start', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    // Передаємо дати у стандартному, чистому форматі ISO (yyyy-MM-dd)
                    from: format(data.dateRange.from, "yyyy-MM-dd"),
                    // Якщо 'to' не обрано, передаємо null
                    to: data.dateRange.to ? format(data.dateRange.to, "yyyy-MM-dd") : null,
                    modules: data.modules,
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Невідома помилка сервера');
            }

            // Успіх!
            toast.success(`Звіт (ID: ${result.reportId}) почав генеруватися.`);

            setActiveReportId(result.reportId);

            // TODO: Тут ви можете запустити логіку WebSocket
            // (наприклад: subscribeToReport(result.reportId);)
            startReport(result.reportId);
            // Скидаємо форму (опціонально)
            form.reset();

        } catch (error: any) {
            console.error("Помилка запуску звіту:", error);
            toast.error(error.message || 'Не вдалося запустити звіт.');
        }
    }

        const isBlobSupported = () =>
            typeof window !== 'undefined' && 'URL' in window && 'createObjectURL' in URL;

        const handleDownloadClick = async () => {
            if (!successData?.downloadUrl || isDownloading) return;

            if (!isBlobSupported()) {
                window.open(successData.downloadUrl, '_blank');
                return;
            }

            setIsDownloading(true);

            try {
                // 1. Завантажуємо файл (CSV) за допомогою fetch
                const response = await fetch(successData.downloadUrl);
                if (!response.ok) {
                    throw new Error('Не вдалося завантажити файл');
                }
                // 2. Отримуємо вміст файлу
                const fileBlob = await response.blob();

                if (fileBlob.size === 0) {
                    throw new Error('Файл порожній');
                }

                // 3. Створюємо тимчасовий, безпечний URL для цього Blob
                const blobUrl = window.URL.createObjectURL(fileBlob);

                // 4. Створюємо невидиме посилання
                const link = document.createElement('a');
                link.href = blobUrl;
                const filename = successData.downloadUrl.split('/').pop() || 'report.csv';
                link.setAttribute('download', filename);
                document.body.appendChild(link);

                // 5. Імітуємо клік (це 100% безпечно для Blob URL)
                link.click();

                // 6. Прибираємо сміття
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl); // Очищуємо пам'ять

                // 7. Тільки ТЕПЕР скидаємо стан
                reset();

            } catch (err) {
                console.error('Помилка завантаження:', err);
                toast.error('Не вдалося завантажити файл.');
            } finally {
                setIsDownloading(false);
            }
        };

        return (
            <Form {...form}>
                <fieldset>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="dateRange"
                            render={({field}) => (
                                <FormItem className="flex flex-col max-w-sm">
                                    <FormLabel>Діапазон дат (З - По)</FormLabel>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <div>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full rounded-[5px] justify-start text-left font-normal",
                                                        !field.value?.from && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4"/>

                                                    {field.value?.from ? (
                                                        field.value.to ? (
                                                            <>
                                                                {format(field.value.from, "dd.MM.yyyy")} -{" "}
                                                                {format(field.value.to, "dd.MM.yyyy")}
                                                            </>
                                                        ) : (
                                                            format(field.value.from, "dd.MM.yyyy")
                                                        )
                                                    ) : (
                                                        <span>Оберіть діапазон</span>
                                                    )}
                                                </Button>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                locale={uk}
                                                selected={field.value as DateRange}
                                                onSelect={(range) => {
                                                    field.onChange(range)
                                                }}
                                                initialFocus
                                                numberOfMonths={2}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="modules"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Перелік модулів</FormLabel>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                        {modules.map((module) => (
                                            <FormField
                                                key={module.id}
                                                control={form.control}
                                                name="modules"
                                                render={({ field }) => {
                                                    const currentValue = field.value || [];
                                                    return (
                                                        <FormItem
                                                            key={module.id}
                                                            className="flex flex-row items-center space-x-3 space-y-0 rounded-[5px] cursor-pointer border border-primary p-3 bg-white/50 shadow-sm hover:bg-secondary"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={currentValue.includes(module.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...currentValue, module.id])
                                                                            : field.onChange(
                                                                                currentValue.filter(
                                                                                    (value) => value !== module.id
                                                                                )
                                                                            );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-sm cursor-pointer">
                                                                {module.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {status === 'pending' ? (
                            <div className="flex items-center space-x-3 p-3 border rounded-md bg-muted/50">
                                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg"
                                     fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-semibold">Звіт генерується...</h3>
                                    <p className="text-xs text-muted-foreground">Це може зайняти деякий час. Будь ласка,
                                        зачекайте.</p>
                                </div>
                            </div>
                        ) : (
                            <Button type="submit" className="rounded-[5px]">Сформувати .csv</Button>
                        )}
                    </form>
                </fieldset>


                {status === 'error' && (
                    <div
                        className="mt-4 p-4 border rounded-md bg-destructive/10 border-destructive/50 text-destructive-foreground">
                        <h3 className="font-semibold">Сталася помилка</h3>
                        <p className="text-sm">На жаль, не вдалося згенерувати звіт:</p>
                        <pre
                            className="text-xs my-2 p-2 bg-destructive/20 rounded font-mono">{error || 'Невідома помилка'}</pre>
                        <Button type="button" onClick={reset} variant="destructive" className="mt-2">
                            Зрозуміло
                        </Button>
                    </div>
                )}

                {status === 'success' && successData?.downloadUrl && (
                    // ✅ 2. ДОДАНО 'relative' для позиціонування 'X'
                    <div className="relative mt-4 p-4 pr-10 border rounded-md bg-green-100 border-green-300 text-green-900">

                        {/* ✅ 3. ДОДАНО КНОПКУ 'X' */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={reset}
                            className="absolute top-2 right-2 p-1 h-auto text-green-900 hover:bg-green-200"
                            aria-label="Закрити"
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        <h3 className="font-semibold">Звіт успішно згенеровано!</h3>
                        <p className="text-sm">Ви можете завантажити його прямо зараз.</p>

                        <Button
                            type="button"
                            disabled={isDownloading}
                            onClick={handleDownloadClick}
                            className={cn(
                                "bg-green-600 text-white hover:bg-green-700 mt-2"
                            )}
                        >
                            {isDownloading ? 'Завантаження...' : 'Завантажити звіт'}
                        </Button>
                    </div>
                )}
            </Form>
        )
    }