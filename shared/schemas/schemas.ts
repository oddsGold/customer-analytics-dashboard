import { z } from 'zod';

export const categoryFormSchema = z.object({
    name: z.string().min(3, 'Назва категорії має містити принаймні 3 символи'),
});
export type TCategoryFormValues = z.infer<typeof categoryFormSchema>;

export const updateCategoryFormSchema = categoryFormSchema.extend({
    id: z.number(),
});
export type TUpdateCategoryFormValues = z.infer<typeof updateCategoryFormSchema>;


export const moduleFormSchema = z.object({
    name: z.string().min(3, 'Назва модуля має містити принаймні 3 символи'),
    moduleId: z.coerce.number()
        .int({ message: "ID має бути цілим числом" })
        .positive({ message: "ID має бути додатнім числом" }),
    categoryId: z.string().min(1, 'Будь ласка, виберіть категорію'),
    isPublished: z.boolean().default(false),
});
export type TModuleFormValues = z.infer<typeof moduleFormSchema>;

export const updateModuleFormSchema = moduleFormSchema.extend({
    id: z.number(),
});
export type TUpdateModuleFormValues = z.infer<typeof updateModuleFormSchema>;