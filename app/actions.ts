'use server';

import {CheckoutFormValues} from "@/shared/constants";
import {prisma} from "@/prisma/prisma-client";
import {OrderStatus, Prisma} from "@prisma/client";
import { cookies } from 'next/headers';
import {createPayment} from "@/shared/lib";
import {hashSync} from "bcrypt";
import {getUserSession} from "@/shared/lib/get-user-session";
import {VerificationUserTemplate} from "@/shared/components/shared/email-temapltes/verification-user";

export async function createOrder(data: CheckoutFormValues) {

    try{
        const cookieStore = cookies();
        const cartToken = cookieStore.get('cartToken')?.value;

        if (!cartToken) {
            throw new Error('Cart token not found');
        }

        const userCart = await prisma.cart.findFirst({
            include: {
                user: true,
                items: {
                    include: {
                        ingredients: true,
                        productItem: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
            where: {
                token: cartToken,
            },
        });

        /* Если корзина не найдена возращаем ошибку */
        if (!userCart) {
            throw new Error('Cart not found');
        }

        /* Если корзина пустая возращаем ошибку */
        if (userCart?.totalAmount === 0) {
            throw new Error('Cart is empty');
        }

        const order = await prisma.order.create({
            data: {
                token: cartToken,
                fullName: data.firstName + ' ' + data.lastName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                comment: data.comment,
                totalAmount: userCart.totalAmount,
                status: OrderStatus.PENDING,
                items: JSON.stringify(userCart.items),
            }
        });

        /* Очищаем корзину */
        await prisma.cart.update({
            where: {
                id: userCart.id,
            },
            data: {
                totalAmount: 0,
            },
        });

        await prisma.cartItem.deleteMany({
            where: {
                cartId: userCart.id,
            },
        });

        const paymentData = await createPayment({
            amount: order.totalAmount,
            orderId: order.id,
            description: 'Оплата заказа #' + order.id,
        });

        if (!paymentData) {
            throw new Error('Payment data not found');
        }

        await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                paymentId: paymentData.id,
            },
        });

        const paymentUrl = paymentData.confirmation.confirmation_url;

        // Отправка email через API маршрут
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: data.email,
                subject: `Next Pizza / Pay for your order #${order.id}`,
                orderId: order.id,
                totalAmount: order.totalAmount,
                paymentUrl,
            }),
        });

        const responseData = await response.json();

        return paymentUrl;

    }catch(err){
        console.log('[CreateOrder] Server error', err);
    }
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