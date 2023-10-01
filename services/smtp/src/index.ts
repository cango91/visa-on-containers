import './utilities/config-secrets';
import { getChannel, initializeRabbitMQ } from './utilities/config-amqp';
import rateLimiter from './utilities/rate-limiter';
import { ConsumeMessage } from 'amqplib';
import sendEmail from './utilities/send-email';



const qPriorities = [
    'statusUpdateEmails',
    'verificationEmails',
    'newsEmails',
    'promotionEmails',
    'genericEmails',
];

async function startConsuming() {
    const channel = getChannel();
    for (const q of qPriorities) {
        await channel.assertQueue(q, { durable: true });

        channel.prefetch(1);

        channel.consume(q, async (message: ConsumeMessage | null) => {
            if (message !== null) {
                if (await rateLimiter.allow()) {
                    await sendEmail(message);
                    channel.ack(message);
                } else {
                    channel.nack(message, false, true);
                }
            }
        });

    }
}

(async () => {
    await initializeRabbitMQ();
    await rateLimiter.init();
    await startConsuming();
})();