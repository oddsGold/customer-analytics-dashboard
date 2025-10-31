import nodemailer from 'nodemailer';
import {NextRequest, NextResponse} from 'next/server';
import {CartItemDTO} from "@/shared/services/dto/cart.dto";

interface Props {
    to: string;
    subject: string;
    orderId: number;
    items: CartItemDTO[];
}

export async function POST(req: NextRequest) {
    const { to, subject, items }: Props = await req.json();

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const htmlContent = `
    <div>
      <h1>Thanks for your purchase! 🎉</h1>
      <p>Your order has been paid. List of products:</p>
      <hr />
      <ul>
        ${items
        .map(
            (item) => `
              <li>
                ${item.productItem.product.name} | ${item.productItem.price} ₽ x ${item.quantity} шт. = ${item.productItem.price * item.quantity} ₽
              </li>`
        )
        .join('')}
      </ul>
    </div>
  `;

    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html: htmlContent,
        });

        return NextResponse.json({ message: 'Email sent successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
