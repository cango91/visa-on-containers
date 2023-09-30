import { Types } from "mongoose";

/**
 * Mail requests initiated by employees should use this interface when requested via API Gateway
 */
export interface ISendMail {
    recipient: string;
    cc?: string[];
    bcc?: string[];
    content: IMailContent;
}

export interface ISendBulkMail {
    recipients: string[];
    content: IMailContent;
}

export interface IMailContent {
    emailType: "verification" | "statusUpdate" | "newsletter" | "promotion",
    subject?: string,
    templateId: string | Types.ObjectId
    variables?: { variable: string, replacement: string }[]
}

/**
 * Internal services that know which queue to enqueue their requests may use this interface directly
 */
export interface IRawMail{
    recipient: string;
    cc?: string[];
    bcc?: string[];
    content: {
        subject: string;
        body: string;
        bodyHtml?: string;
    }
}