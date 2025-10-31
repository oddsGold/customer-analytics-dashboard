import nodemailer from 'nodemailer';
import {NextRequest, NextResponse} from 'next/server';

export async function POST(req: NextRequest) {
    const { to, subject, orderId, totalAmount, paymentUrl } = await req.json();

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {


        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html:
            `<div>
                <h1>Order #${orderId}</h1>
                <p>
                    Pay for the order in the amount of <b>${totalAmount} $</b>. Follow
                    <a href="${paymentUrl}">this link</a> to pay for your order.
                </p>
            </div>`,
        });

        return NextResponse.json({ message: 'Email sent successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
