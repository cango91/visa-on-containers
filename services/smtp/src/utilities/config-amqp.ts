import amqp, { Connection, Channel } from 'amqplib';

let channel: Channel, connection: Connection;
const connectionString = process.env.RABBIT_URL ? process.env.RABBIT_URL : 'amqp://localhost/'

export async function initializeRabbitMQ(retries = 5, backoff = 3000) {
  if (retries === 0) {
    throw new Error('Max retries reached, could not connect to RabbitMQ.');
  }

  try {
    let fullConnString = connectionString.split("://");
    const { SMTP_RABBIT_USER, SMTP_RABBIT_PASSWORD } = process.env;
    fullConnString = [fullConnString[0], "://", SMTP_RABBIT_USER!, ":", SMTP_RABBIT_PASSWORD!, '@', fullConnString[1]];
    const finalConnectionString = fullConnString.join('');
    connection = await amqp.connect(finalConnectionString);
    await res();
    console.log("Connected to RabbitMQ");
    // connection.on("error", ()=>console.log("rabbit connection closed unexpectedly. Reinitializing"));
    // connection.on("close",initializeRabbitMQ);
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

export function getConnection(){
  if(!connection) throw new Error("Connection to RabbitMQ not established yet");
  return connection;
}

export async function res() {
  try {
    channel = await connection.createChannel();
    channel.on("error", () => console.log('rabbit channel closed'));
    channel.on("close", res);
  } catch (error) {
    console.error('Failed to restart RabbitMQ connection', error);
  }
}

export async function closeRabbitMQ() {
  try {
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Failed to close RabbitMQ connection', error);
  }
}