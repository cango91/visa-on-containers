import { ConsumeMessage } from "amqplib";
import { getChannel } from "../utilities/config-amqp";
import { onCallback, resendToken } from "../utilities/verification-service";

const MAX_BACKOFF = 60000;
const channel = getChannel();

export default async function startConsuming() {
    const channel = getChannel();
    await bindQueues();
    channel.consume('gateway.auth-callback', async (message: ConsumeMessage | null) => {
        if (message) {
            try {
                await onCallback(message.content.toString());
                channel.ack(message);
            } catch (error) {
                console.error(error);
                channel.nack(message, false, false);
            }
        }
    });
    channel.consume('gateway.auth-resend', async (message: ConsumeMessage | null) => {
        if (message) {
            try {
                await resendToken(message.content.toString());
                channel.ack(message);
            } catch (error) {
                console.error(error);
                channel.nack(message, false, false);
            }
        }
    });
}

async function bindQueues(backoff = 1000) {
    try {
        const qCb = "gateway.auth-callback";
        const qResend = "gateway.auth-resend";
        await channel.assertQueue(qCb, { durable: true });
        await channel.assertQueue(qResend, { durable: true });
        await channel.bindQueue(qCb, 'gateway-exchange', qCb);
        await channel.bindQueue(qResend, 'gateway-exchange', qResend);
    } catch (error) {
        console.warn(`Exchange not ready. Retrying in ${backoff}ms`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return bindQueues(Math.max(backoff * 2, MAX_BACKOFF));
    }
}