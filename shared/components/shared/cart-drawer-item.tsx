import React from 'react';
import {cn} from "@/shared/lib/utils";
import {Image, Info, Price} from "@/shared/components/shared/cart-item-details";
import {CartItemProps} from "@/shared/components/shared/cart-item-details/cart-item-details.types";
import {CountButton} from "@/shared/components/shared/count-button";
import {Trash2Icon} from "lucide-react";
import {Spinner} from "@/shared/components/ui";

interface Props extends CartItemProps {
    onClickCountButton?: (type: 'plus' | 'minus') => void;
    onClickRemove?: () => void;
    loadingItemIds: (number | string)[];
    className?: string;
}

export const CartDrawerItem: React.FC<Props> = ({
                                                    id,
                                                    imageUrl,
                                                    name,
                                                    price,
                                                    quantity,
                                                    details,
                                                    onClickCountButton,
                                                    onClickRemove,
                                                    className,
                                                    loadingItemIds
                                                }) => {
    const isLoading = loadingItemIds.includes(id);

    return (
        <div className={cn('relative flex bg-white p-5 gap-6', className)}>
            <Image src={imageUrl}/>

            <div className="flex-1">
                <Info name={name} details={details} />

                <hr className="my-3" />

                <div className="flex items-center justify-between">
                    <CountButton onClick={onClickCountButton} value={quantity} />

                    <div className="flex items-center gap-3">
                        <Price value={price} />
                        <Trash2Icon onClick={onClickRemove} className="text-gray-400 cursor-pointer hover:text-gray-600" size={16} />
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <Spinner size="large" />
                </div>
            )}
        </div>
    );
};
