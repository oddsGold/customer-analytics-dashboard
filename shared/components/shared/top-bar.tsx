import React from 'react';
import { Container } from './container';
import { Categories } from './categories';
import { SortPopup } from './sort-popup';
import { cn } from "@/shared/lib/utils";
import {Category} from "@prisma/client";

interface Props {
    categories: Category[];
    className?: string;
}

export const TopBar: React.FC<Props> = ({categories, className }) => {
    return (
        <div className={cn('sticky top-0 bg-white py-5 shadow-lg shadow-black/5 z-10', className)}>
            <Container className="flex flex-wrap items-center justify-between sm:flex-row flex-col gap-4">
                <Categories items={categories} className="flex-1 sm:flex-none sm:w-auto" />
                <SortPopup className="mt-4 sm:mt-0 sm:w-auto text-sm md:text-base" />
            </Container>
        </div>
    );
};
