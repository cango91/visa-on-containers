import { ConsumeMessage } from "amqplib";
import { getChannel } from "../utilities/config-amqp";
import { GenericBackoff } from "@cango91/visa-on-containers-common";

const MAX_BACKOFF = 60000;
const channel = getChannel();

export default async function startConsuming() {
    const channel = getChannel();
    await bindQueues();
}

async function bindQueues() {
    await GenericBackoff(_bindQueues,1000,MAX_BACKOFF,"Exchange not ready")
}

async function _bindQueues() {
    const qCb = "gateway.auth-callback";
    const qResend = "gateway.auth-resend";
    await channel.assertQueue(qCb, { durable: true });
    await channel.assertQueue(qResend, { durable: true });
    await channel.bindQueue(qCb, 'gateway-exchange', qCb);
    await channel.bindQueue(qResend, 'gateway-exchange', qResend);
}