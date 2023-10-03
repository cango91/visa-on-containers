import './utilities/config-secrets';
import { startConsuming } from './consumers/consumers';
import { getConnection, initializeRabbitMQ } from './utilities/config-amqp';
import express from 'express';

const app = express();
const port = 3010;

app.get('/', (req, res) => res.send('Hello, TypeScript! This is the Gateway!'));

app.listen(port, () => console.log(`Gateway API service running at http://localhost:${port}/`));

async function initializeServices(){
    await initializeRabbitMQ()
    const rabbitConn = getConnection();
    rabbitConn.on("error", () => console.log("Rabbit MQ connection closed unexpectedly"));
    rabbitConn.on("close", initializeServices);
    await startConsuming();
}

(async ()=>{
    initializeServices();
})();