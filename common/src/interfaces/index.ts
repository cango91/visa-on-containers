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

////////////
// AUTH 
///////////

export interface ILocalAuthRequest{
    email: string;
    password: string;
}

export interface IOAuthRequest{
    code: string;
}

export interface IAuthResponse{
    accessToken: string;
    refreshToken: string;
}