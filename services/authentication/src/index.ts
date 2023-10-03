import './utilities/config-secrets';
import express from 'express';
import sanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import authService from './middleware/auth-service';
import { getConnection, initializeRabbitMQ } from './utilities/config-amqp';
import startConsuming from './consumers/consumers';
import connectDB from './utilities/config-db';
import authRouter from './routes/atuh-router';


const PORT = 3001;

const configureApp = (middleware?: any[]) => {
    const app = express();

    app.use(morgan('dev'));
    app.use(express.json());
    app.use(sanitize());

    if (middleware) {
        app.use(middleware);
    }

    return app;
}

const app = configureApp([authService]);
app.use("/api/auth", authRouter);

app.listen(PORT, () => console.log(`Authentication service running at http://localhost:${PORT}/`));

async function initializeServices() {
    await initializeRabbitMQ();
    const rabbitConn = getConnection();
    rabbitConn.on("error", () => console.log("Rabbit MQ connection closed unexpectedly"));
    rabbitConn.on("close", initializeServices);
    //await startConsuming();
}

connectDB();

(async () => await initializeServices())();