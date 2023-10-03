import mongoose from "mongoose";
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
    emailType: "verification" | "statusUpdate" | "newsletter" | "promotion";
    subject?: string;
    templateId: string;
    variables?: {
        variable: string;
        replacement: string;
    }[];
}
export interface IRawMail {
    recipient: string;
    cc?: string[];
    bcc?: string[];
    content: {
        subject: string;
        body: string;
        bodyHtml?: string;
    };
}
export interface IMailTemplate {
    name: string;
    subject: string;
    body: string;
    bodyHtml?: string;
    variables?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    _id: mongoose.Types.ObjectId | string;
}
export interface ILocalAuthRequest {
    email: string;
    password: string;
}
export interface IOAuthRequest {
    code: string;
}
export interface IAuthResponse {
    accessToken: string;
    refreshToken: string;
}
export declare function GenericBackoff(func: () => Promise<any>, backoff?: number, max_backoff?: number, msg?: string): Promise<void>;
export declare function GenericBackoffWithMaxRetry(func: () => Promise<any>, backoff?: number, retries?: number, msg?: string): Promise<void>;
