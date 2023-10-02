import amqp, { Connection, Channel } from 'amqplib';

let channel: Channel, connection: Connection;
const connectionString = process.env.RABBIT_URL ? process.env.RABBIT_URL : 'amqp://localhost/'

export async function initializeRabbitMQ(retries = 5, backoff = 3000) {
  if (retries === 0) {
    throw new Error('Max retries reached, could not connect to RabbitMQ.');
  }

  try {
    let fullConnString = connectionString.split("://");
    const { EMAIL_RABBIT_USER, EMAIL_RABBIT_PASSWORD } = process.env;
    fullConnString = [fullConnString[0], "://", EMAIL_RABBIT_USER!, ":", EMAIL_RABBIT_PASSWORD!, '@', fullConnString[1]];
    const finalConnectionString = fullConnString.join('');
    connection = await amqp.connect(finalConnectionString);
    channel = await connection.createChannel();
    await channel.assertExchange('email-exchange', 'direct', {
      durable: true,
    });
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error(`Failed to connect to RabbitMQ, retrying in ${backoff}ms...`);
    await new Promise(resolve => setTimeout(resolve, backoff));
    return initializeRabbitMQ(retries - 1, backoff * 2);
  }
}

export function getChannel() {
  if (!channel) throw new Error('Channel to RabbitMQ not established yet');
  return channel;
}

export async function closeRabbitMQ() {
  try {
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Failed to close RabbitMQ connection', error);
  }
}