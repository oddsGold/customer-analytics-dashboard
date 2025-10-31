'use client';

import React, {useCallback} from 'react';
import {Title} from "@/shared/components/shared/title";
import {cn} from "@/shared/lib/utils";
import {ProductCard} from "@/shared/components/shared/product-card";
import { useIntersection } from 'react-use';
import {useCategoryStore} from "@/shared/store/category";
import {ProductWithRelations} from "@/@types/prisma";

interface Props {
    title: string;
    items: ProductWithRelations[];
    className?: string;
    listClassName?: string;
    categoryId: number;
}

export const ProductGroupList: React.FC<Props> = ({
                                                      title,
                                                      items,
                                                      className,
                                                      listClassName,
                                                      categoryId
                                                  }) => {
    const setActiveCategoryId = useCategoryStore((state)=> state.setActiveId)
    const intersectionRef = React.useRef(null);
    const intersection = useIntersection(intersectionRef, {
        threshold: 0.4
    });

    React.useEffect(() => {
        if(intersection?.isIntersecting) {
            setActiveCategoryId(categoryId);
        }
    },[categoryId, intersection?.isIntersecting, title]);

    return (
        <div className={className} id={title}>
            <div ref={intersectionRef}></div>
            <Title text={title} size="lg" className="font-extrabold mb-5" />

            <div className={cn('grid grid-cols-3 gap-[50px]', listClassName)}>
                {items.map((product, i) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.items[0].price}
                        imageUrl={product.imageUrl}
                        ingredients={product.ingredients}
                    />
                ))}
            </div>
        </div>
    )
}