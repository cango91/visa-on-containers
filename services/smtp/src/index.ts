import './utilities/config-secrets';
import { ConsumeMessage } from 'amqplib';
import { getChannel, initializeRabbitMQ } from './utilities/config-amqp';
import rateLimiter from './utilities/rate-limiter';
import sendEmail from './utilities/send-email';
import { getFailureCount, incrementFailureCount, resetFailureCount } from './utilities/failure-limiter';

// do not requeue after FAIL_TRESHOLD failures
const FAIL_TRESHOLD = 10;

const qPriorities = [
    'statusUpdateEmails',
    'verificationEmails',
    'newsEmails',
    'promotionEmails',
    'genericEmails',
];

async function startConsuming() {
    console.log("starting consuming")
    const channel = getChannel();
    for (const q of qPriorities) {
        await channel.assertQueue(q, { durable: true });

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

(async () => {
    await initializeRabbitMQ();
    await rateLimiter.init();
    await startConsuming();
})();