import client from './config-redis';

export async function incrementFailureCount(id:string){
    const key = `email_failure_count:${id}`;
    return await client.incr(key);
}

export async function resetFailureCount(id:string){
    const key = `email_failure_count:${id}`;
    await client.del(key);
}

export async function getFailureCount(id:string){
    const key = `email_failure_count:${id}`;
    return await client.get(key);
}