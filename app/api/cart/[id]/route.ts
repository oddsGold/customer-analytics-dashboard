import {prisma} from "@/prisma/prisma-client";
import {NextRequest, NextResponse} from "next/server";
import {updateCartTotalAmount} from "@/shared/lib";

export async function PATCH(req: NextRequest, {params}: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        const data = (await req.json()) as {quantity: number};
        const token = req.cookies.get('cartToken')?.value;

        if (!token) {
            return NextResponse.json({error: "Cart token not found"});
        }

        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id,
            }
        });

        if(!cartItem) {
            return NextResponse.json({error: "Cart item not found"});
        }

        await prisma.cartItem.update({
            where: {
                id,
            },
            data: {
                quantity: data.quantity,
            }
        });

        return NextResponse.json(await updateCartTotalAmount(token));
    } catch (e) {
        console.error('[CART_PATCH] Server error', e);
        return NextResponse.json({message: `Не удалось обновить корзину`}, {status: 500});
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        const token = req.cookies.get('cartToken')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Cart token not found' });
        }

        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: Number(params.id),
            },
        });

        if (!cartItem) {
            return NextResponse.json({ error: 'Cart item not found' });
        }

        await prisma.cartItem.delete({
            where: {
                id,
            },
        });

        return NextResponse.json(await updateCartTotalAmount(token));
    } catch (error) {
        console.log('[CART_DELETE] Server error', error);
        return NextResponse.json({ message: 'Не удалось удалить корзину' }, { status: 500 });
    }
}