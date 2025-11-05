'use client';

import { cn } from '@/shared/lib/utils';
import React, {useState} from 'react';
import { Container } from './container';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {Button} from "@/shared/components/ui";
import {ProfileButton} from "@/shared/components/shared/profile-button";
import {useSession, signOut} from "next-auth/react";
import { Loader2 } from 'lucide-react';

interface Props {
    hasSearch?: boolean;
    hasCart?: boolean;
    className?: string;
}

export const Header: React.FC<Props> = ({ hasSearch = true, hasCart = true, className }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);


    const searchParams = useSearchParams();

    const onClickSignOut = async () => {
        setLoading(true);
        try {
            await signOut({
                callbackUrl: '/',
            });
        } catch (error) {
            console.error("Помилка під час виходу:", error);
            setLoading(false);
        }
    };

    return (
        <header className={cn('border-b', className)}>
            <Container className="flex items-center justify-between py-8">
                <Link href="/">
                    <div className="flex items-center gap-4">
                        <Image src="/logo.png" alt="Logo" width={35} height={35} />
                        <div>
                            <h1 className="text-2xl uppercase font-black">customers dashboard</h1>
                            <p className="text-sm text-gray-400 leading-3">панель аналітики клієнта</p>
                        </div>
                    </div>
                </Link>


                <div className="flex items-center gap-3">

                    <ProfileButton />

                    {session && (
                        <Button
                            disabled={loading}
                            onClick={onClickSignOut}
                            variant="outline"
                            className="text-base disabled:bg-secondary rounded-[5px]"
                        >
                            {loading ? (
                                <>
                                    <span className="pr-2">Вийти</span> <Loader2 className="animate-spin" size={18} />
                                </>
                            ): (
                                'Вийти'
                            )}
                        </Button>
                    )}
                </div>
            </Container>
        </header>
    );
};