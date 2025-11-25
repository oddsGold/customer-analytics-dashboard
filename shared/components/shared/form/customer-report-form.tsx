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
import {CategoryWithModules, DateRangePayload, ReportStartResponse, RequestBody} from "@/shared/constants";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/shared/components/ui/form";
import {useSession,signOut} from "next-auth/react";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {cn} from "@/shared/lib/utils";

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
    isUnique: z.boolean().default(false),
    isNew: z.boolean().default(false),
})
    .refine(data => {
        const hasAnyDate = (range: { from?: Date; to?: Date } | null | undefined) => {
            return !!range?.from || !!range?.to;
        };

        const hasStartDate = hasAnyDate(data.licenseStartDate);
        const hasEndDate = hasAnyDate(data.licenseEndDate);
        const hasActivationDate = hasAnyDate(data.licenseActivationDate);

        return hasStartDate || hasEndDate || hasActivationDate;
    }, {
        message: "Будь ласка, оберіть хоча б одну дату в будь-якому діапазоні.",
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
            isUnique: false,
            isNew: false,
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
            const formatDateRange = (range: { from?: Date; to?: Date } | undefined | null): DateRangePayload => {
                if (!range || (!range.from && !range.to)) {
                    return { from: null, to: null };
                }

                return {
                    from: range.from ? format(range.from, "yyyy-MM-dd") : null,
                    to: range.to ? format(range.to, "yyyy-MM-dd") : null,
                };
            };

            const params: RequestBody = {
                modules: data.modules,
                options: {
                    unique: data.isUnique,
                    new: data.isNew
                },
                dates: {
                    start: formatDateRange(data.licenseStartDate),
                    end: formatDateRange(data.licenseEndDate),
                    activation: formatDateRange(data.licenseActivationDate),
                },
            };

            const response: ReportStartResponse = await API.clients.startReport(params);

            toast.success(`Звіт почав генеруватися.`);
            startReport(response.reportId);
            // form.reset();

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
            await API.clients.cancelReport(activeReportId);
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

                    <div className="mt-6 mb-4 space-y-4">
                        <div className="text-2xl font-medium block mb-4">
                            Додаткові опції:
                        </div>

                        <div className="flex flex-row gap-8">
                            <FormField
                                control={form.control}
                                name="isNew"
                                render={({ field }) => (
                                    <FormItem
                                        className={cn(
                                            "relative flex flex-row items-start space-x-3 space-y-0 rounded-[5px] border p-4 shadow-sm cursor-pointer transition-all duration-200",
                                            field.value
                                                ? "border-primary bg-primary/10"
                                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                        )}
                                    >
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="cursor-pointer font-normal after:absolute after:inset-0">
                                                Нова ліцензія
                                            </FormLabel>
                                            <FormDescription>
                                                Показати лише нових клієнтів
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isUnique"
                                render={({ field }) => (
                                    <FormItem
                                        className={cn(
                                            "relative flex flex-row items-start space-x-3 space-y-0 rounded-[5px] border p-4 shadow-sm cursor-pointer transition-all duration-200",
                                            field.value
                                                ? "border-primary bg-primary/10"
                                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                        )}
                                    >
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="cursor-pointer font-normal after:absolute after:inset-0">
                                                Унікальні ЄДРПОУ
                                            </FormLabel>
                                            <FormDescription>
                                                Групувати результати за ЄДРПОУ
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
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
