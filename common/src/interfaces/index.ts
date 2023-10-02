////////////
// EMAIL 
///////////
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
    variables?: { variable: string, replacement: string }[];
}
export interface IRawMail {
    recipient: string;
    cc?: string[];
    bcc?: string[];
    content: {
        subject: string;
        body: string;
        bodyHtml?: string;
    }
}

////////////
// AUTH 
///////////

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

////////////
// FUNCTIONS 
///////////

export async function GenericBackoff(func: () => Promise<any>, backoff = 2000, max_backoff = 60000) {
    try {
        await func();
    } catch (error) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        return GenericBackoff(func, Math.min(max_backoff, backoff * 2), max_backoff);
    }
}

export async function GenericBackoffWithMaxRetry(func: () => Promise<any>, backoff = 2000, retries = 10) {
    try {
        await func();
    } catch (e) {
        if (retries <= 0) {
            throw new Error("Reached max retries");
        }
        await new Promise(resolve => setTimeout(resolve, backoff));
        return GenericBackoffWithMaxRetry(func, backoff * 2, retries - 1);
    }
}