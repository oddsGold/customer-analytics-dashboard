import React from 'react';
import { Button } from '../ui/button';
import { CircleUser, User } from 'lucide-react';
import Link from 'next/link';

interface Props {
    className?: string;
}

export const ProfileButton: React.FC<Props> = ({ className }) => {
    return (
        <div className={className}>
            <Link href="/profile">
                <Button variant="secondary" className="flex items-center gap-2 rounded-[5px] border border-primary">
                    <CircleUser size={18} />
                    Профіль
                </Button>
            </Link>
        </div>
    );
};