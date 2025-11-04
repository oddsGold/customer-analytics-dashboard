'use server';

import {prisma} from "@/prisma/prisma-client";
import {Prisma} from "@prisma/client";
import {hashSync} from "bcrypt";
import {getUserSession} from "@/shared/lib/get-user-session";


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