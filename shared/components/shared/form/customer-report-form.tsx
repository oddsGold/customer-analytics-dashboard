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
import {ReportStartResponse} from "@/shared/constants";


const FormSchema = z.object({
    dateRange: z.object(
        {
            from: z.date({ required_error: "Дата 'З' є обов'язковою." }),
            to: z.date().optional(),
        },
        { required_error: "Будь ласка, оберіть діапазон дат." }
    ),
    modules: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof FormSchema>;

export function CustomerReportForm() {
    const { status, startReport } = useReportStore()

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

    async function onSubmit(data: FormValues) {
        try {
            const params = {
                from: format(data.dateRange.from, "yyyy-MM-dd"),
                to: data.dateRange.to ? format(data.dateRange.to, "yyyy-MM-dd") : null,
                modules: data.modules,
            };
            const response: ReportStartResponse = await API.clients.startReport(params);

            toast.success(response.message || `Звіт почав генеруватися.`);
            startReport(response.reportId);
            form.reset();

        } catch (error: any) {
            toast.error(error.message || 'Не вдалося запустити звіт.');
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <fieldset>

                    <FormDateRangePicker control={form.control} />

                    <FormModuleCheckboxes control={form.control} />

                    <FormActions status={status} />

                </fieldset>
            </form>

            <FormResult />
        </Form>
    )
}
