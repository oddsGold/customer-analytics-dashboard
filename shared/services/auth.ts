import { User } from '@prisma/client';
import {instance} from "@/shared/services/instance";

export const getMe = async () => {
    const { data } = await instance.get<User>('/auth/me');

    return data;
};