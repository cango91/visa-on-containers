import { ConsumeMessage } from "amqplib";

export default async function sendEmail(message:ConsumeMessage){
    console.log(`Sending email: ${message.content.toString()}`);
}