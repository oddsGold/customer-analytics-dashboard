"use client"

import * as React from "react"
import { format } from "date-fns" // Потрібно для форматування дати у кнопці
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker" // Тип для діапазону дат
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
    FormLabel, FormMessage
} from "@/shared/components/ui";
import {Calendar} from "@/shared/components/ui/calendar";
import { uk } from "date-fns/locale"
import {useReportStore} from "@/shared/store";

const FormSchema = z.object({
    dateRange: z.object(
        {
            from: z.date({ required_error: "Дата 'З' є обов'язковою." }),
            to: z.date().optional(), // 'По' може бути необов'язковим
        },
        { required_error: "Будь ласка, оберіть діапазон дат." }
    ),
})

type FormValues = z.infer<typeof FormSchema>;

export function DateRangeForm() {
    // Стан для керування Popover (щоб він закривався після вибору)
    const [open, setOpen] = React.useState(false);
    const { status, startReport } = useReportStore();
    console.log(status);
    // 2. Ініціалізуємо react-hook-form
    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            dateRange: {
                from: undefined,
                to: undefined,
            },
        },
    })

    const setActiveReportId = useReportStore((state) => state.setActiveReportId);

    // 3. Обробник відправки форми
    async function onSubmit(data: FormValues) {
        try {
            const response = await fetch('/api/report/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Передаємо дати у стандартному, чистому форматі ISO (yyyy-MM-dd)
                    from: format(data.dateRange.from, "yyyy-MM-dd"),
                    // Якщо 'to' не обрано, передаємо null
                    to: data.dateRange.to ? format(data.dateRange.to, "yyyy-MM-dd") : null
                })
            });

            const result = await response.json();

            if (!response.ok) {
                // Якщо сервер повернув помилку
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-sm">

                <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Діапазон дат (З - По)</FormLabel>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <div>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value?.from && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />

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
                                        mode="range" // <-- 5. Вмикаємо режим діапазону
                                        locale={uk}
                                        selected={field.value as DateRange} // 'selected' бере значення з RHF
                                        onSelect={(range) => {
                                            field.onChange(range); // 'onSelect' оновлює RHF
                                            // if (range?.to) { // Якщо обрали кінцеву дату
                                            //     setOpen(false); // Закриваємо popover
                                            // }
                                        }}
                                        initialFocus
                                        numberOfMonths={2} // Показуємо 2 місяці для зручності
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {status === 'pending' ? (
                    <div className="flex items-center space-x-3 p-3 border rounded-md bg-muted/50">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div className="flex flex-col">
                            <h3 className="text-sm font-semibold">Звіт генерується...</h3>
                            <p className="text-xs text-muted-foreground">Це може зайняти деякий час. Будь ласка, зачекайте.</p>
                        </div>
                    </div>
                ) : (
                    <Button type="submit">Відправити</Button>
                )}
            </form>
        </Form>
    )
}
