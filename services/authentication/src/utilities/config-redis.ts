import * as redis from 'redis';
const redisOptions: redis.RedisClientOptions = {};

if (process.env.REDIS_URL) {
  redisOptions.url = process.env.REDIS_URL;
}

if (process.env.REDIS_PASS) {
  redisOptions.password = process.env.REDIS_PASS;
}

const client = redis.createClient(redisOptions);

client.on('error', (err) => {
    console.error(`Error in Redis client: ${err}`);
});
client.on('connect', () => {
    console.log('Connected to Redis');
});
client.on('ready', () => {
    console.log('Redis client ready');
});
client.on('end', () => {
    console.log('Redis client ended');
});
(async () => await client.connect())();

export default client;