"use client";

import * as React from "react"
import { format } from "date-fns"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { useReportStore } from "@/shared/store";
import {FormActions, FormDateRangePicker, FormModuleCheckboxes, FormResult} from "@/shared/components/shared";
import {API} from "@/shared/services/api-client";
import {CategoryWithModules, ReportStartResponse, RequestBody} from "@/shared/constants";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import {useSession,signOut} from "next-auth/react";

interface ReportFormWrapperProps {
    categories: CategoryWithModules[];
}

const OptionalDateRangeSchema = z.object({
    from: z.date().optional(),
    to: z.date().optional()
}).optional().nullable();

const FormSchema = z.object({
    licenseStartDate: OptionalDateRangeSchema,
    licenseEndDate: OptionalDateRangeSchema,
    licenseActivationDate: OptionalDateRangeSchema,
    modules: z.array(z.string()).optional(),
    parameter: z.string().optional().nullable(),
})
    .refine(data => {
        const hasStartDate = !!data.licenseStartDate?.from;
        const hasEndDate = !!data.licenseEndDate?.from;
        const hasActivationDate = !!data.licenseActivationDate?.from;

        return hasStartDate || hasEndDate || hasActivationDate;
    }, {
        message: "Будь ласка, оберіть 'дату з' хоча б для одного діапазону.",
        path: [],
    });

type FormValues = z.infer<typeof FormSchema>;

export function CustomerReportForm({ categories }: ReportFormWrapperProps) {
    const { status, startReport, activeReportId } = useReportStore();
    const { data: session } = useSession();

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        mode: 'onSubmit',
        defaultValues: {
            licenseStartDate: undefined,
            licenseEndDate: undefined,
            licenseActivationDate: undefined,
            modules: [],
            parameter: undefined,
        },
    })

    // @ts-ignore - zodResolver некоректно кладе root-помилку в [""]
    const rootErrorMessage = form.formState.errors[""]?.message;

    async function onSubmit(data: FormValues) {
        if (!session) {
            await signOut({
                callbackUrl: '/',
            });
            return;
        }

        if (new Date(session.expires) < new Date()) {
            signOut();
            return;
        }

        try {
            const formatDateRange = (range: { from?: Date; to?: Date } | undefined | null) => {
                if (!range?.from) {
                    return null;
                }
                return {
                    from: format(range.from, "yyyy-MM-dd"),
                    to: range.to ? format(range.to, "yyyy-MM-dd") : null,
                };
            };

            const params: RequestBody = {
                modules: data.modules,
                parameter: data.parameter,
                licenseStartDate: formatDateRange(data.licenseStartDate),
                licenseEndDate: formatDateRange(data.licenseEndDate),
                licenseActivationDate: formatDateRange(data.licenseActivationDate),
            };

            const response: ReportStartResponse = await API.clients.startReport(params);

            toast.success(`Звіт почав генеруватися.`);
            startReport(response.reportId);
            form.reset();

        } catch (error: any) {
            toast.error('Не вдалося запустити звіт.');
        }
    }

    async function handleCancel() {
        if (!activeReportId) {
            toast.error("Не вдалося знайти ID активного звіту. Спробуйте оновити сторінку.");
            return;
        }
        try {
            await API.clients.cancelReport(activeReportId); // Виклик API
            toast.success("Запит на скасування надіслано.");

        } catch (error: any) {
            toast.error(error.message || 'Не вдалося скасувати звіт.');
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <fieldset>
                    <div className="mb-4 text-2xl font-medium">Параметри запиту:</div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-2">
                        <FormDateRangePicker
                            control={form.control}
                            name="licenseStartDate"
                            title="Дата початку дії ліцензії"
                            trigger={form.trigger}
                        />

                        <FormDateRangePicker
                            control={form.control}
                            name="licenseEndDate"
                            title="Дата закінчення ліцензії"
                            trigger={form.trigger}
                        />

                        <FormDateRangePicker
                            control={form.control}
                            name="licenseActivationDate"
                            title="Дата активації ліцензії"
                            trigger={form.trigger}
                        />
                    </div>

                    {rootErrorMessage && (
                        <p className="text-sm font-medium text-destructive">
                            {rootErrorMessage}
                        </p>
                    )}

                    <div className="mt-6 mb-4">
                        <FormField
                            control={form.control}
                            name="parameter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-2xl font-medium">Додаткові параметри:</FormLabel>

                                    <Select onValueChange={field.onChange}>
                                        <FormControl className="rounded-[5px] border border-primary shadow-sm hover:bg-secondary">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Оберіть додатковий параметр..." />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent className="rounded-[5px]">
                                            <SelectGroup>
                                                <SelectLabel>Тип звіту</SelectLabel>
                                                <SelectItem className="rounded-[5px]" value="1">Нова ліцензія</SelectItem>
                                                <SelectItem className="rounded-[5px]" value="2">Унікальні ЄДРПОУ</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>

                                    <FormDescription>
                                        Ви можете додати один додатковий фільтр до вашого звіту.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormModuleCheckboxes
                        control={form.control}
                        categories={categories}
                    />

                    <FormActions status={status} onCancel={handleCancel} />

                </fieldset>
            </form>

            <FormResult />
        </Form>
    )
}
