import { Channel, ConsumeMessage } from "amqplib";
import { getChannel } from "../utilities/config-amqp";
import { GenericBackoff, IMailTemplate, ISendMail } from "@cango91/visa-on-containers-common";
import { EMAIL_SERVICE_URL, COMPANY_NAME, BASE_URL } from "../constants";
import { sendServiceRequest } from "../utilities/utils";
import redisClient from "../utilities/config-redis";

const MAX_BACKOFF = 60000;

let channel: Channel;

const { EMAIL_SERVICE_SECRET } = process.env;

export async function startConsuming() {
    await bindQueues();
    console.log("queues bound");
    await channel.consume("auth.token", async (message: ConsumeMessage | null) => {
        if (message) {
            try {
                let cached = await redisClient.get("verification-emails-cache");
                if (!cached) {
                    cached = await cacheTemplates();
                }
                const templates: Array<IMailTemplate> = JSON.parse(cached);
                templates.sort((a, b) => Number(new Date(a.updatedAt!)) - Number(new Date(b.updatedAt!)));
                const templateId = templates[0]._id;
                const parsed = JSON.parse(message.content.toString());
                const verificationLink = `${BASE_URL}/api/verify-email/?token=${parsed.token}`;
                const response = await sendServiceRequest(`${EMAIL_SERVICE_URL}/api/email/send`, EMAIL_SERVICE_SECRET!, 'POST', {
                    recipient: parsed.email,
                    content: {
                        templateId,
                        variables: [
                            { variable: "$__emailAddress", replacement: parsed.email },
                            { variable: "$__companyName", replacement: COMPANY_NAME },
                            { variable: "$__verificationLink", replacement: verificationLink }
                        ],
                        emailType: 'verification'
                    },
                });
                if (!response.ok) {
                    throw new Error("Couldn't send email verification: " + await response.text());
                }
                channel.ack(message);
            } catch (error) {
                console.error(error);
                channel.nack(message,false,true);
            }
        }
    });
}

async function bindQueues() {
    await GenericBackoff(_bindQueues, 1000, MAX_BACKOFF, "Exchange not ready");
}

async function _bindQueues() {
    channel = getChannel();
    const qTokens = "auth.token";
    await channel.assertQueue(qTokens, { durable: true });
    await channel.bindQueue(qTokens, 'auth-exchange', qTokens);
}

async function cacheTemplates() {
    try {
        const response = await sendServiceRequest(`${EMAIL_SERVICE_URL}/api/templates`, EMAIL_SERVICE_SECRET!);
        if (response.ok) {
            const parsed = await response.json();
            const stringified = JSON.stringify(parsed);
            await redisClient.set("verification-emails-cache", stringified);
            return stringified;
        } else {
            throw new Error("Couldn't cache templates");
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}