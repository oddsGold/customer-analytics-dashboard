import { prisma } from '@/prisma/prisma-client';
import { getUserSession } from '@/shared/lib/get-user-session';
import { redirect } from 'next/navigation';
import {Container, ProfileForm, Title} from "@/shared/components/shared";
import {UserRole} from "@prisma/client";
import {SettingsDashboard} from "@/shared/components/shared/settings-dashboard";
import Link from "next/link";
import React from "react";

export default async function ProfilePage() {
    const session = await getUserSession();

    if (!session) {
        return redirect('/not-auth');
    }

    const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

    if (!user) {
        return redirect('/not-auth');
    }

    if (!user || user.role !== UserRole.ADMIN) {
        return redirect('/access-denied');
    }

    const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            author: { select: { fullName: true }}
        }
    });

    const modules = await prisma.module.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            author: { select: { fullName: true }},
            category: { select: { name: true }}
        }
    });

    return (
        <Container className="my-10">
            <div className="mx-auto w-full max-w-[970px]">
                <div className="mb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Title text="Панель Керування" size="md" className="font-bold"/>
                        <nav aria-label="breadcrumb">
                            <ol className="flex items-center gap-2 font-medium">
                                <Link href="/">Dashboard</Link>
                                <li aria-hidden="true" role="presentation">/</li>
                                <li className="text-primary">Settings</li>
                            </ol>
                        </nav>
                    </div>
                    <p className="text-gray-600">Керування категоріями та модулями системи.</p>
                </div>

                <SettingsDashboard
                    initialCategories={categories}
                    initialModules={modules}
                />
            </div>
        </Container>
    )
}