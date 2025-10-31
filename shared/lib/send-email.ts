// import nodemailer from 'nodemailer';
// import { render } from '@react-email/render';
//
// export const sendEmail = async (to: string, subject: string, template: React.ReactNode) => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: Number(process.env.SMTP_PORT),
//         secure: false,
//         auth: {
//             user: process.env.SMTP_USER,
//             pass: process.env.SMTP_PASSWORD,
//         },
//     });
//
//     try {
//         const htmlContent = await render(template as React.ReactElement);
//
//         await transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to,
//             subject,
//             html: htmlContent,
//         });
//
//         return { success: true };
//     } catch (error) {
//         throw new Error('Failed to send email');
//     }
// };