import React from "react";
import {
    categoryFormSchema,
    TCategoryFormValues,
    TUpdateCategoryFormValues,
    updateCategoryFormSchema
} from "@/shared/schemas/schemas";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {FormInput} from "@/shared/components/shared/form/form-input";
import {Button} from "@/shared/components/ui";

export const CategoryForm: React.FC<{
    defaultValues: TCategoryFormValues | TUpdateCategoryFormValues;
    onSubmit: (data: any) => Promise<void>;
    isEdit: boolean;
}> = ({ defaultValues, onSubmit, isEdit }) => {
    const form = useForm({
        resolver: zodResolver(isEdit ? updateCategoryFormSchema : categoryFormSchema),
        defaultValues,
    });

    const handleSubmit = async (data: TCategoryFormValues | TUpdateCategoryFormValues) => {
        try {
            await onSubmit(data);
            toast.success(isEdit ? 'Категорію оновлено' : 'Категорію створено');
        } catch (e: any) {
            toast.error(`Помилка: ${e.message}`);
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormInput name="name" label="Назва категорії" className="rounded-[5px]" required />
                <Button type="submit" disabled={form.formState.isSubmitting} className="mt-4 w-full rounded-[5px]">
                    {form.formState.isSubmitting ? 'Збереження...' : (isEdit ? 'Оновити' : 'Створити')}
                </Button>
            </form>
        </FormProvider>
    );
};