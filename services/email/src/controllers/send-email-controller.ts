import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import {IRawMail, ISendMail} from '@cango91/visa-on-containers-common';
import EmailTemplate from '../models/email-template';
import { getChannel } from '../utilities/config-amqp';

export async function sendEmail(req: Request, res: Response) {
    try {
        const params: ISendMail = req.body;
        const template = await EmailTemplate.findById(params.content.templateId);

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        let subject = params.content.subject || template.subject;
        let body = template.body;
        let bodyHtml = template.bodyHtml;

        if (params.content.variables && params.content.variables.length) {
            params.content.variables.forEach(({ variable, replacement }) => {
                const regex = new RegExp(variable.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "gi");
                body = body.replace(regex, replacement);
                bodyHtml = bodyHtml?.replace(regex, replacement);
                subject = subject.replace(regex, replacement);
            });
        }

        // put the mail in queue, depending on emailType
        const channel = getChannel();

        let qName: string;
        switch (params.content.emailType) {
            case 'verification':
                qName = 'verificationEmails';
                break;
            case 'newsletter':
                qName = 'newsEmails';
                break;
            case 'promotion':
                qName = 'promotionEmails';
                break;
            case 'statusUpdate':
                qName = 'statusUpdateEmails';
                break;
            default:
                qName = 'genericEmails';
        }

        // await channel.assertQueue(qName);
        // await channel.bindQueue(qName, 'emailExchange', qName);

        const messagePayload:IRawMail = {
            recipient: params.recipient,
            cc: params.cc,
            bcc: params.bcc,
            content: {
                body,
                bodyHtml,
                subject
            }
        };

        channel.publish('email-exchange', qName, Buffer.from(JSON.stringify(messagePayload)),{messageId: uuid()});
        return res.status(200).json({ message: "Email prepared and queued", body, subject, bodyHtml });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}
