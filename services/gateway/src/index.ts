import './utilities/config-secrets';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { startConsuming } from './consumers/consumers';
import { getConnection, initializeRabbitMQ } from './utilities/config-amqp';
import express from 'express';
import bearer from './middleware/bearer';
import authRouter from './routes/auth-router';

const port = 3010;

const configureApp = (middleware?: any[]) => {
    const app = express();

    app.use(morgan('dev'));
    app.use(express.json());
    app.use(cookieParser(process.env.GATEWAY_COOKIE_SECRET));

    if (middleware) {
        app.use(middleware);
    }

    return app;
}


const app = configureApp([bearer]);

app.use('/api/users', authRouter);

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