'use server';

import {prisma} from "@/prisma/prisma-client";
import {Prisma} from "@prisma/client";
import {hashSync} from "bcrypt";
import {getUserSession} from "@/shared/lib/get-user-session";

import {
    TCategoryFormValues,
    TModuleFormValues,
    TUpdateCategoryFormValues,
    TUpdateModuleFormValues
} from '@/shared/schemas/schemas';
import { UserRole } from '@prisma/client';
import {revalidatePath} from "next/cache";


async function getAdminSession() {
    const session = await getUserSession();
    if (!session?.id) {
        throw new Error('Не авторизований');
    }

    const user = await prisma.user.findFirst({ where: { id: Number(session.id) }});
    if (!user) {
        throw new Error('Користувача не знайдено');
    }

    if (user.role !== UserRole.ADMIN) {
        throw new Error('Доступ заборонено. Потрібні права адміністратора.');
    }

    return user;
}

export async function updateUserInfo(body: Prisma.UserUpdateInput) {
    try {
        const currentUser = await getUserSession();

        if (!currentUser) {
            throw new Error('Пользователь не найден');
        }

        const findUser = await prisma.user.findFirst({
            where: {
                id: Number(currentUser.id),
            },
        });

        const passwordToHash = body.password;

        const newHashedPassword = passwordToHash && typeof passwordToHash === "string"
            ? hashSync(passwordToHash, 10)
            : findUser?.password;

        await prisma.user.update({
            where: {
                id: Number(currentUser.id),
            },
            data: {
                fullName: body.fullName,
                email: body.email,
                password: newHashedPassword,
            },
        });
    } catch (err) {
        console.log('Error [UPDATE_USER]', err);
        throw err;
    }
}

export async function registerUser(body: Prisma.UserCreateInput) {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: body.email,
            },
        });

        if (user) {
            if (!user.verified) {
                throw new Error('Почта не подтверждена');
            }

            throw new Error('Пользователь уже существует');
        }

        const createdUser = await prisma.user.create({
            data: {
                fullName: body.fullName,
                email: body.email,
                password: hashSync(body.password, 10),
            },
        });

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.verificationCode.create({
            data: {
                code,
                userId: createdUser.id,
            },
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/verification-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: createdUser.email,
                subject: `'Next Pizza / 📝 Подтверждение регистрации`,
                code,
            }),
        });

        const responseData = await response.json();

    } catch (err) {
        console.log('Error [CREATE_USER]', err);
        throw err;
    }
}


export const createCategory = async (data: TCategoryFormValues) => {
    const admin = await getAdminSession(); // Перевірка прав адміна

    try {
        await prisma.category.create({
            data: {
                name: data.name,
                authorId: admin.id,
            }
        });
        revalidatePath('/settings'); // Оновлюємо сторінку налаштувань
    } catch (e: any) {
        if (e.code === 'P2002') throw new Error('Категорія з такою назвою вже існує');
        throw new Error(`Помилка створення категорії: ${e.message}`);
    }
};

export const updateCategory = async (data: TUpdateCategoryFormValues) => {
    await getAdminSession();

    try {
        await prisma.category.update({
            where: { id: data.id },
            data: {
                name: data.name,
            }
        });
        revalidatePath('/settings');
    } catch (e: any) {
        if (e.code === 'P2002') throw new Error('Категорія з такою назвою вже існує');
        throw new Error(`Помилка оновлення категорії: ${e.message}`);
    }
};

export const deleteCategory = async (id: number) => {
    await getAdminSession();

    try {
        const modulesInCategory = await prisma.module.count({ where: { categoryId: id }});
        if (modulesInCategory > 0) {
            throw new Error(`Неможливо видалити. До категорії прив'язано ${modulesInCategory} модулів.`);
        }

        await prisma.category.delete({
            where: { id }
        });
        revalidatePath('/settings');
    } catch (e: any) {
        throw new Error(`Помилка видалення категорії: ${e.message}`);
    }
};

export const createModule = async (data: TModuleFormValues) => {
    const admin = await getAdminSession();

    try {
        await prisma.module.create({
            data: {
                name: data.name,
                moduleId: data.moduleId,
                isPublished: data.isPublished,
                authorId: admin.id,
                categoryId: Number(data.categoryId),
            }
        });
        revalidatePath('/settings');
    } catch (e: any) {
        if (e.code === 'P2002') throw new Error('Модуль з такою назвою вже існує');
        throw new Error(`Помилка створення модуля: ${e.message}`);
    }
};

export const updateModule = async (data: TUpdateModuleFormValues) => {
    await getAdminSession();

    try {
        await prisma.module.update({
            where: { id: data.id },
            data: {
                name: data.name,
                moduleId: data.moduleId,
                isPublished: data.isPublished,
                categoryId: Number(data.categoryId),
            }
        });
        revalidatePath('/settings');
    } catch (e: any) {
        if (e.code === 'P2002') throw new Error('Модуль з такою назвою вже існує');
        throw new Error(`Помилка оновлення модуля: ${e.message}`);
    }
};

export const deleteModule = async (id: number) => {
    await getAdminSession();

    try {
        await prisma.module.delete({
            where: { id }
        });
        revalidatePath('/settings');
    } catch (e: any) {
        throw new Error(`Помилка видалення модуля: ${e.message}`);
    }
};