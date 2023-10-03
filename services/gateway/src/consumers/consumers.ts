import { Channel, ConsumeMessage } from "amqplib";
import { getChannel } from "../utilities/config-amqp";
import { GenericBackoff } from "@cango91/visa-on-containers-common";

const MAX_BACKOFF = 60000;

let channel: Channel;

export async function startConsuming() {
    await bindQueues();
    console.log("queues bound");
    await channel.consume("auth.token", (message:ConsumeMessage|null) =>{
        if(message){
            console.log(`Gateway received message: ${message.content.toString()}`);
        }
    });
}

async function bindQueues() {
    await GenericBackoff(_bindQueues,1000,MAX_BACKOFF,"Exchange not ready");
}

async function _bindQueues() {
    channel = getChannel();
    const qTokens = "auth.token";
    await channel.assertQueue(qTokens, {durable:true});
    await channel.bindQueue(qTokens,'auth-exchange',qTokens);
}