'use client';

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TFormLoginValues, formLoginSchema } from './schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Title } from '../../../title';
import { FormInput } from '../../../form';
import { Button } from '@/shared/components/ui';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Props {
    onClose?: VoidFunction;
}

export const LoginForm: React.FC<Props> = ({ onClose }) => {
    const router = useRouter();

    const form = useForm<TFormLoginValues>({
        resolver: zodResolver(formLoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: TFormLoginValues) => {
        try {
            const resp = await signIn('credentials', {
                ...data,
                redirect: false,
            });

            if (resp && !resp?.ok) {
                throw new Error(resp.error || 'Невідома помилка авторизації');
            }

            router.refresh();
            toast.success('Ви успішно увійшли до облікового запису', {
                icon: '✅',
            });

            onClose?.();
        } catch (error) {
            toast.error('Неможливо увійти в аккаунт', {
                icon: '❌',
            });
        }
    };

    return (
        <FormProvider {...form}>
            <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex justify-between items-center">
                    <div className="mr-2">
                        <Title text="Форма входу" size="md" className="font-bold" />
                        <p className="text-gray-400">Введіть свою електронну адресу, щоб увійти до свого облікового запису</p>
                    </div>
                    <img src="/assets/images/phone-icon.png" alt="phone-icon" width={60} height={60} />
                </div>

                <FormInput name="email" label="E-Mail" required />
                <FormInput name="password" label="Password" type="password" required />

                <Button loading={form.formState.isSubmitting} className="h-12 text-base" type="submit">
                    Увійти
                </Button>
            </form>
        </FormProvider>
    );
};