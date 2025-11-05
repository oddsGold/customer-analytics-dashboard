import {Container, Header, Title} from "@/shared/components/shared";
import React, {Suspense} from "react";
import {LoginForm} from "@/shared/components/shared/modals/auth-modal/forms/login-form";
import {getUserSession} from "@/shared/lib/get-user-session";
import { prisma } from '@/prisma/prisma-client';
import {CustomerReportForm} from "@/shared/components/shared/form/CustomerReportForm";
import {ReportStatusListener} from "@/shared/components/shared/ReportStatusListener";
import {ReportStatusModal} from "@/shared/components/shared/ReportStatusModal";


export default async function Home() {
    const session = await getUserSession();
    let user = null;

    if (session) {
        user = await prisma.user.findFirst({
            where: { id: Number(session?.id) }
        });
    }

    return (
        <>

            {!user ? (
                <div className="w-full h-screen flex items-center justify-center">
                    <div className="w-[450px] bg-white p-10 rounded-lg shadow-md">
                        <LoginForm />
                    </div>
                </div>
            ) : (
                <>
                    <Suspense>
                        <Header />
                    </Suspense>

                    <ReportStatusListener userId={user.id} />
                    {/*<ReportStatusModal />*/}

                    <Container className="mt-10">
                        <Title text="Звіти по клієнтах" size="lg" className="font-extrabold"/>
                        <p className="text-sm text-gray-600">Оберіть параметри для вибірки</p>
                    </Container>

                    <Container className="mt-10 pb-14">
                        <div className="flex gap-[80px]">
                            <div className="flex-1">
                                <div className="flex flex-col gap-4">
                                    <CustomerReportForm />
                                </div>
                            </div>
                        </div>
                    </Container>
                </>
            )}
        </>
    );
}
