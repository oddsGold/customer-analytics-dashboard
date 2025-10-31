import {z} from 'zod';

export const passwordSchema = z.string().min(4, {message: 'Введіть правильний пароль'});

export const formLoginSchema = z.object({
    email: z.string().email({message: 'Введіть коректну пошту'}),
    password: passwordSchema,
});

export const formUpdateUserDataSchema =
    z.object({
        email: z.string().email({message: 'Введіть коректну пошту'}),
        fullName: z.string().min(2, {message: 'Введіть ім\'я та прізвище'}),
        password: z.string().refine(val => val === '' || val.length >= 4, {
            message: 'String must contain at least 4 character(s)',
        }).optional(),
        confirmPassword: z.string().refine(val => val === '' || val.length >= 4, {
            message: 'String must contain at least 4 character(s)',
        }).optional(),
    })
        .refine((data) => {
            if (data.password || data.confirmPassword) {
                return data.password === data.confirmPassword;
            }
            return true;
        }, {
            message: 'The passwords do not match',
            path: ['confirmPassword'],
        });

export type TFormLoginValues = z.infer<typeof formLoginSchema>;
export type TFormUpdateUserValues = z.infer<typeof formUpdateUserDataSchema>;