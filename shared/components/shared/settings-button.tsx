import React from 'react';
import { Button } from '../ui/button';
import {Settings} from 'lucide-react';
import Link from 'next/link';

interface Props {
    className?: string;
}

export const SettingsButton: React.FC<Props> = ({ className }) => {
    return (
        <div className={className}>
            <Link href="/settings">
                <Button variant="secondary" className="flex items-center gap-2 rounded-[5px] border border-primary">
                    <Settings size={18} />
                    Налаштування
                </Button>
            </Link>
        </div>
    );
};