import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/prisma/prisma-client";
import bcrypt from 'bcryptjs';

export async function GET() {
    const users = await prisma.user.findMany();

    return NextResponse.json(users)
}

export async function POST(req: NextRequest, res: NextResponse) {
    const { email, fullName, password } = await req.json();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            email,
            fullName,
            password: hashedPassword,
        }
    });

    return NextResponse.json(user)
}