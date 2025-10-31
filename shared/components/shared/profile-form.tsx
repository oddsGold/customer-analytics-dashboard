'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    formUpdateUserDataSchema,
    TFormUpdateUserValues
} from './modals/auth-modal/forms/schemas';
import { User } from '@prisma/client';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { Container } from './container';
import { Title } from './title';
import { FormInput } from './form';
import { Button } from '../ui';
import { updateUserInfo } from '@/app/actions';
import Link from "next/link";

interface Props {
    data: User;
}

export const ProfileForm: React.FC<Props> = ({ data }) => {
    const form = useForm({
        resolver: zodResolver(formUpdateUserDataSchema),
        defaultValues: {
            fullName: data.fullName,
            email: data.email,
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: TFormUpdateUserValues) => {
        try {
            await updateUserInfo({
                email: data.email,
                fullName: data.fullName,
                password: data.password,
            });

            toast.error('Дані оновлені 📝', {
                icon: '✅',
            });
        } catch (error) {
            return toast.error('Помилка під час оновлення даних', {
                icon: '❌',
            });
        }
    };

    const onClickSignOut = () => {
        signOut({
            callbackUrl: '/',
        });
    };

    return (
        <Container className="my-10">

            <div className="mx-auto w-full max-w-[970px]">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Title text={`Персональна інформація | #${data.id}`} size="md" className="font-bold"/>
                    <nav aria-label="breadcrumb">
                        <ol className="flex items-center gap-2 font-medium">
                            <Link href="/">Dashboard</Link>
                            <li aria-hidden="true" role="presentation">/</li>
                            <li className="text-primary">Profile</li>
                        </ol>
                    </nav>
                </div>
                <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <div className="relative z-20 h-35 md:h-65">
                        <img alt="profile cover" loading="lazy" width="970"
                             height="260" decoding="async" data-nimg="1"
                             className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
                             srcSet="/cover-01.webp"
                             src="/cover-01.webp"
                             style={{ color: 'transparent', width: 'auto', height: 'auto' }}/>
                    </div>
                    <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
                        <div
                            className="relative z-30 mx-auto -mt-[5.5rem] h-[7.5rem] w-full max-w-[7.5rem] rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3">
                            <div className="relative drop-shadow-2">
                                <img alt="profile" loading="lazy" width="160"
                                     height="160" decoding="async" data-nimg="1"
                                     className="overflow-hidden rounded-full"
                                     srcSet="/human-icon.png"
                                     src="/human-icon.png"
                                     style={{ color: 'transparent' }}/>
                                </div>
                        </div>
                        <div className="mt-4">
                            <FormProvider {...form}>
                                <form className="flex flex-col gap-5 mt-10" onSubmit={form.handleSubmit(onSubmit)}>
                                    <FormInput name="email" className="text-left" label="E-Mail" required/>
                                    <FormInput name="fullName" className="text-left" label="Full name" required/>

                                    <FormInput type="password" className="text-left" name="password" label="New password"/>
                                    <FormInput type="password" className="text-left" name="confirmPassword" label="Repeat password"/>

                                    <Button disabled={form.formState.isSubmitting} className="text-base mt-10" type="submit">
                                        Зберегти
                                    </Button>

                                    <Button
                                        onClick={onClickSignOut}
                                        variant="secondary"
                                        disabled={form.formState.isSubmitting}
                                        className="text-base"
                                        type="button">
                                        Вийти
                                    </Button>
                                </form>
                            </FormProvider>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};