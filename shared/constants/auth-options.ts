import {AuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { prisma } from '@/prisma/prisma-client';
import { compareSync } from 'bcrypt';

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }

                const values = {
                    email: credentials.email,
                };

                const findUser = await prisma.user.findFirst({
                    where: values,
                });

                if (!findUser) {
                    return null;
                }

                const isPasswordValid = compareSync(credentials.password, findUser.password);

                if (!isPasswordValid) {
                    return null;
                }

                // if (!findUser.verified) {
                //     return null;
                // }

                return {
                    id: findUser.id,
                    email: findUser.email,
                    name: findUser.fullName,
                    role: findUser.role,
                };
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 5 * 60 * 60,
        updateAge: 1 * 60 * 60
    },
    callbacks: {
        async signIn({ account }) {
            if (account?.provider === 'credentials') {
                return true;
            }
            return false;
        },
        async jwt({ token }) {
            if (!token.email) {
                return token;
            }

            const findUser = await prisma.user.findFirst({
                where: {
                    email: token.email,
                },
            });

            if (findUser) {
                token.id = String(findUser.id);
                token.email = findUser.email;
                token.fullName = findUser.fullName;
                token.role = findUser.role;
            }

            return token;
        },
        session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }

            return session;
        },
    },
};