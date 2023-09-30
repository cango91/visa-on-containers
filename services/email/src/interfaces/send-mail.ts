import { Types } from "mongoose";

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
    subject: string,
    templateId: string | Types.ObjectId
    variables?: { variable: string, replacement: string }[]
}