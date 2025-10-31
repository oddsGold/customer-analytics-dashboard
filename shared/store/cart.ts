import {create} from "zustand";
import { API } from '../services/api-client';
import {CartStateItem, getCartDetails} from "@/shared/lib/get-cart-details";
import {CreateCartItemValues} from "@/shared/services/dto/cart.dto";

export type ICartItem = {
    id: number;
    quantity: number;
    name: string;
    image_url: string;
    price: number;
    pizzaSize?: number | null;
    type?: number | null;
    ingredients: Array<{ name: string; price: number }>;
}

export interface CartState {
    loading: boolean;
    loadingItemIds: (number | string)[];
    error: boolean;
    totalAmount: number;
    items: CartStateItem[];

    /* Получение товаров из корзины */
    fetchCartItems: () => Promise<void>;

    /* Запрос на обновление количества товара */
    updateItemQuantity: (id: number, quantity: number) => Promise<void>;

    /* Запрос на добавление товара в корзину */
    addCartItem: (values: CreateCartItemValues) => Promise<void>;

    /* Запрос на удаление товара из корзины */
    removeCartItem: (id: number) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    error: false,
    loading: true,
    loadingItemIds: [],
    totalAmount: 0,

    fetchCartItems: async () => {
        try {
            set({ loading: true, error: false });
            const data = await API.cart.getCart();
            set(getCartDetails(data));
        } catch (error) {
            console.error(error);
            set({ error: true });
        } finally {
            set({ loading: false });
        }
    },

    updateItemQuantity: async (id: number, quantity: number) => {
        try {
            set((state) => ({
                loading: true,
                loadingItemIds: [...state.loadingItemIds, id],
                error: false,
            }));
            const data = await API.cart.updateItemQuantity(id, quantity);
            set(getCartDetails(data));
        } catch (error) {
            console.error(error);
            set({ error: true });
        } finally {
            set((state) => ({
                loading: false,
                loadingItemIds: state.loadingItemIds.filter((itemId) => itemId !== id),
            }));
        }
    },

    removeCartItem: async (id: number) => {
        try {
            set((state) => ({
                loading: true,
                loadingItemIds: [...state.loadingItemIds, id],
                error: false,
                items: state.items.map((item) => (item.id === id ? { ...item, disabled: true } : item)),
            }));
            const data = await API.cart.removeCartItem(id);
            set(getCartDetails(data));
        } catch (error) {
            console.error(error);
            set({ error: true });
        } finally {
            set((state) => ({
                loading: false,
                loadingItemIds: state.loadingItemIds.filter((itemId) => itemId !== id),
                items: state.items.map((item) => ({ ...item, disabled: false })),
            }));
        }
    },

    addCartItem: async (values: CreateCartItemValues) => {
        try {
            set({ loading: true, error: false });
            const data = await API.cart.addCartItem(values);
            set(getCartDetails(data));
        } catch (error) {
            console.error(error);
            set({ error: true });
        } finally {
            set({ loading: false });
        }
    },
}));