import React, {useMemo} from "react";
import {
    moduleFormSchema,
    TModuleFormValues,
    TUpdateModuleFormValues,
    updateModuleFormSchema
} from "@/shared/schemas/schemas";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {FormSelect} from "@/shared/components/shared/form/form-select";
import {FormInput} from "@/shared/components/shared/form/form-input";
import {FormCheckbox} from "@/shared/components/shared/form/form-checkbox";
import {Button} from "@/shared/components/ui";
import {Category} from "@prisma/client";

type FullCategory = Category & { author: { fullName: string | null } };

export const ModuleForm: React.FC<{
    categories: FullCategory[];
    defaultValues: TModuleFormValues | TUpdateModuleFormValues;
    onSubmit: (data: any) => Promise<void>;
    isEdit: boolean;
}> = ({ categories, defaultValues, onSubmit, isEdit }) => {
    const form = useForm({
        resolver: zodResolver(isEdit ? updateModuleFormSchema : moduleFormSchema),
        defaultValues,
    });

    const categoryOptions = useMemo(() =>
        categories.map(cat => ({
            value: String(cat.id),
            label: cat.name,
        })), [categories]
    );

    const handleSubmit = async (data: TModuleFormValues | TUpdateModuleFormValues) => {
        try {
            await onSubmit(data);
            toast.success(isEdit ? 'Модуль оновлено' : 'Модуль створено');
        } catch (e: any) {
            toast.error(`Помилка: ${e.message}`);
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormSelect
                    name="categoryId"
                    label="Категорія"
                    options={categoryOptions}
                    placeholder="-- Оберіть категорію --"
                    required
                />
                <FormInput name="name" label="Назва модуля" required />
                <FormInput
                    name="moduleId"
                    label="ID Модуля (унікальне число)"
                    type="number"
                    required
                />
                <FormCheckbox name="isPublished" label="Опубліковано" />
                <Button type="submit" disabled={form.formState.isSubmitting} className="mt-4 w-full rounded-[5px]">
                    {form.formState.isSubmitting ? 'Збереження...' : (isEdit ? 'Оновити' : 'Створити')}
                </Button>
            </form>
        </FormProvider>
    );
};