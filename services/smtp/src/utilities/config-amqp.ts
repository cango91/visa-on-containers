import { GenericBackoffWithMaxRetry } from '@cango91/visa-on-containers-common';
import amqp, { Connection, Channel } from 'amqplib';

let channel: Channel, connection: Connection;
const connectionString = process.env.RABBIT_URL ? process.env.RABBIT_URL : 'amqp://localhost/'


export async function connectRabbitMQ() {
  let fullConnString = connectionString.split("://");
  const { SMTP_RABBIT_USER, SMTP_RABBIT_PASSWORD } = process.env;
  fullConnString = [fullConnString[0], "://", SMTP_RABBIT_USER!, ":", SMTP_RABBIT_PASSWORD!, '@', fullConnString[1]];
  const finalConnectionString = fullConnString.join('');
  connection = await amqp.connect(finalConnectionString);
  await res();
}

export async function initializeRabbitMQ() {
  await GenericBackoffWithMaxRetry(connectRabbitMQ,3000,10,"Failed to connect to RabbitMQ");
}


export function getChannel() {
  if (!channel) throw new Error('Channel to RabbitMQ not established yet');
  return channel;
}

export function getConnection() {
  if (!connection) throw new Error("Connection to RabbitMQ not established yet");
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