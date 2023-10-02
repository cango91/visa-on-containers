import amqlib from 'amqplib';
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
// RABBITMQ 
///////////

// export async function CreateExchangesAndQueues() {
//     const exchanges = [
//         {
//             name: "auth-exchange", type: "direct", options: { durable: true }, boundQueues: [
//                 {name: "verificationToken", options: {durable:true,exclusive:true}, routingKey: "auth.token"}
//             ]
//         },
//         { name: "email-exchange", type: "direct", options: { durable: true }, boundQueues: [
//             {name: "verificationEmails", options: {durable: true}, routingKey: "verificationEmails"},
//             {name: "statusUpdateEmails", options: {durable: true}, routingKey: "statusUpdateEmails"},
//             {name: "promotionEmails", options: {durable: true}, routingKey: "promotionEmails"},
//             {name: "newsEmails", options: {durable: true}, routingKey: "newsEmails"},
//             {name: "genericEmails", options: {durable: true}, routingKey: "genericEmails"},
//         ] },
//         {
//             name: "gateway-exchange", type: "direct", options: { durable: true }, boundQueues: [
//                 { name: "authResend", options: { durable: true, exclusive: true }, routingKey: "auth.resend" },
//                 { name: "authCallback", options: { durable: true, exclusive: true }, routingKey: "auth.callback" },
//                 { name: "sendVerification", options: { durable: true, exclusive: true }, routingKey: "gateway.send-verification" },
//             ]
//         }
//     ];
//     exchanges.forEach(exchange => {
        
//     })

// }