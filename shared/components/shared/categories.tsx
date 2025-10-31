'use client';

import React from 'react';
import { cn } from "@/shared/lib/utils";
import {useCategoryStore} from "@/shared/store/category";
import {Category} from "@prisma/client";

interface Props {
    items: Category[];
    className?: string;
}

export const Categories: React.FC<Props> = ({items, className }) => {
    const categoryActiveId = useCategoryStore((state)=> state.activeId);

    return (
        <div className={cn(
            'flex flex-wrap gap-2 bg-green-50 p-2 rounded-2xl sm:flex-nowrap',
            className
        )}>
            {
                items.map(({name, id}, index) => (
                    <a
                        className={cn(
                            'flex items-center font-bold h-11 rounded-2xl px-5 justify-center w-full sm:w-auto',
                            categoryActiveId === id && 'bg-white shadow-md shadow-gray-200 text-primary'
                        )}
                        href={`/#${name}`}
                        key={index}>
                        <button>{name}</button>
                    </a>
                ))
            }
        </div>
    );
};
