"use client";

import * as React from "react"
import { format } from "date-fns"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Form } from "@/shared/components/ui";
import { useReportStore } from "@/shared/store";
import {FormActions, FormDateRangePicker, FormModuleCheckboxes, FormResult} from "@/shared/components/shared";
import {API} from "@/shared/services/api-client";
import {CategoryWithModules, ReportStartResponse} from "@/shared/constants";

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
    const { status, startReport } = useReportStore()

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        mode: 'onChange',
        defaultValues: {
            licenseStartDate: undefined,
            licenseEndDate: undefined,
            licenseActivationDate: undefined,
            modules: [],
        },
    })

    // @ts-ignore - zodResolver некоректно кладе root-помилку в [""]
    const rootErrorMessage = form.formState.errors[""]?.message;

    async function onSubmit(data: FormValues) {
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

            const params: any = {
                modules: data.modules,
            };

            const formattedStartDate = formatDateRange(data.licenseStartDate);
            if (formattedStartDate) {
                params.licenseStartDate = formattedStartDate;
            }

            const formattedEndDate = formatDateRange(data.licenseEndDate);
            if (formattedEndDate) {
                params.licenseEndDate = formattedEndDate;
            }

            const formattedActivationDate = formatDateRange(data.licenseActivationDate);
            if (formattedActivationDate) {
                params.licenseActivationDate = formattedActivationDate;
            }


            const response: ReportStartResponse = await API.clients.startReport(params);

            toast.success(`Звіт почав генеруватися.`);
            startReport(response.reportId);
            form.reset();

        } catch (error: any) {
            toast.error('Не вдалося запустити звіт.');
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <fieldset>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-2">
                        <FormDateRangePicker
                            control={form.control}
                            name="licenseStartDate"
                            title="Дата початку дії ліцензії"
                        />

                        <FormDateRangePicker
                            control={form.control}
                            name="licenseEndDate"
                            title="Дата закінчення ліцензії"
                        />

                        <FormDateRangePicker
                            control={form.control}
                            name="licenseActivationDate"
                            title="Дата активації ліцензії"
                        />

                        {rootErrorMessage && (
                            <p className="text-sm font-medium text-destructive">
                                {rootErrorMessage}
                            </p>
                        )}
                    </div>

                    <FormModuleCheckboxes
                        control={form.control}
                        categories={categories}
                    />

                    <FormActions status={status} />

                </fieldset>
            </form>

            <FormResult />
        </Form>
    )
}
