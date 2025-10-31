import {prisma} from "@/prisma/prisma-client";
import {NextRequest, NextResponse} from "next/server";
import {findOrCreateCart, updateCartTotalAmount} from "@/shared/lib";
import {CreateCartItemValues} from "@/shared/services/dto/cart.dto";

export async function GET(req: NextRequest) {
    try{
        const token = req.cookies.get('cartToken')?.value;

        if(!token) {
            return NextResponse.json({totalAmount: 0, items: []});
        }

        const userCart = await prisma.cart.findFirst({
            where: {
                OR: [
                    {
                        token,
                    },
                ],
            },
            include: {
                items: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        productItem: {
                            include: {
                                product: true,
                            },
                        },
                        ingredients: true,
                    },
                },
            },
        });

        return NextResponse.json(userCart);
    }catch(err){
        console.error(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        let token = req.cookies.get('cartToken')?.value;

        if (!token) {
            token = crypto.randomUUID();
        }

        const userCart = await findOrCreateCart(token);

        const data = (await req.json()) as CreateCartItemValues;

        const findCartItems = await prisma.cartItem.findMany({
            where: {
                cartId: userCart.id,
                productItemId: data.productItemId,
            },
            include: {
                ingredients: true,
            },
        });

        const isSameIngredients = (cartItemIngredients: { id: number }[]) => {
            const cartItemIds = cartItemIngredients.map((ing) => ing.id).sort();
            const dataIngredientIds = (data.ingredients ?? []).sort();

            return JSON.stringify(cartItemIds) === JSON.stringify(dataIngredientIds);
        };

        const findCartItem = findCartItems.find((cartItem) => isSameIngredients(cartItem.ingredients));

        if (findCartItem) {
            await prisma.cartItem.update({
                where: {
                    id: findCartItem.id,
                },
                data: {
                    quantity: findCartItem.quantity + 1,
                },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: userCart.id,
                    productItemId: data.productItemId,
                    quantity: 1,
                    ingredients: { connect: data.ingredients?.map((id) => ({ id })) },
                },
            });
        }

        const updatedUserCart = await updateCartTotalAmount(token);

        const resp = NextResponse.json(updatedUserCart);
        resp.cookies.set('cartToken', token);
        return resp;
    } catch (error) {
        console.log('[CART_POST] Server error', error);
        return NextResponse.json({ message: 'Не удалось создать корзину' }, { status: 500 });
    }
}