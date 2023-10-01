import * as nodemailer from 'nodemailer';
import { ConsumeMessage } from "amqplib";
import { IRawMail } from '@cango91/visa-on-containers-common';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_EMAIL_USER,
        pass: process.env.SMTP_EMAIL_PASSWORD
    }
});

export default async function sendEmail(message: ConsumeMessage) {
    try {
        const mail: IRawMail = JSON.parse(message.content.toString());
        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.SMTP_EMAIL_FROM,
            to: mail.recipient,
            cc: mail.cc,
            bcc: mail.bcc,
            subject: mail.content.subject,
            text: mail.content.body,
            html: mail.content.bodyHtml,
        }
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: ", info.messageId);
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error;
    }
}