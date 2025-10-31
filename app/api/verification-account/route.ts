import nodemailer from 'nodemailer';
import {NextRequest, NextResponse} from 'next/server';

interface Props {
    to: string;
    subject: string;
    code: string;
}

export async function POST(req: NextRequest) {
    const { to, subject, code }: Props = await req.json();

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
        <p>
            Verification code: <h2>${code}</h2>
        </p>

        <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/verify?code=${code}">Confirm registration</a>
        </p>
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
