import './utilities/config-secrets';
import { Channel, Connection, ConsumeMessage } from 'amqplib';
import { getChannel, getConnection, initializeRabbitMQ, res } from './utilities/config-amqp';
import rateLimiter from './utilities/rate-limiter';
import sendEmail from './utilities/send-email';
import { getFailureCount, incrementFailureCount, resetFailureCount } from './utilities/failure-limiter';
import { GenericBackoff } from '@cango91/visa-on-containers-common';

// do not requeue mail tasks after FAIL_TRESHOLD failures
const FAIL_TRESHOLD = 10;

// max timelimit to wait before retrying queue bindings
const MAX_BACKOFF = 60000;

const qPriorities = [
    'statusUpdateEmails',
    'verificationEmails',
    'newsEmails',
    'promotionEmails',
    'genericEmails',
];

let channel: Channel, connection: Connection;

async function _bindQueues() {
    channel = getChannel();
    for (const q of qPriorities) {
        await channel.assertQueue(q, { durable: true });
        await channel.bindQueue(q, 'email-exchange', q);
    }
}


async function bindQueues() {
    await GenericBackoff(_bindQueues, 1000, MAX_BACKOFF, "Exchange not ready");
}

async function startConsuming() {
    console.log("starting consuming")
    await bindQueues();
    console.log("queues bound");
    for (const q of qPriorities) {
        channel.prefetch(1);
        channel.consume(q, async (message: ConsumeMessage | null) => {
            if (message !== null) {
                const uniqueId = message.properties.messageId;
                if (await rateLimiter.allow()) {
                    try {
                        await sendEmail(message);
                        channel.ack(message);
                        await resetFailureCount(uniqueId);
                    } catch (error) {
                        const failureCount = Number(await getFailureCount(uniqueId));
                        console.log("Fail: ", failureCount);
                        if (failureCount >= FAIL_TRESHOLD) {
                            channel.nack(message, false, false);
                        } else {
                            await incrementFailureCount(uniqueId);
                            channel.nack(message, false, true);
                        }
                    }
                } else {
                    channel.nack(message, false, true);
                }
            }
        });

    }
}

async function main() {
    await initializeRabbitMQ();
    await rateLimiter.init();
    await startConsuming();
    connection = getConnection();
    connection.on("error", () => console.log("Rabbit Connection closed unexpectedly"));
    connection.on("close", async () => {
        await main();
    })

}

(async () => {
    await main();
})();