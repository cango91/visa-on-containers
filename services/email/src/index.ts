import './utilities/config-secrets';
import express from 'express';
import sanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import authService from './middleware/auth-service';
import templateRouter from './routes/email-template-route';
import { getConnection, initializeRabbitMQ } from './utilities/config-amqp';
import emailRouter from './routes/send-email';
import connectDB from './utilities/config-db';

const PORT = 4000;

let rabbitConn;

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

(async () => await connectDB())();

app.use('/api/templates', templateRouter);
app.use('/api/email', emailRouter);

app.listen(PORT, () => console.log(`Mail service running at http://localhost:${PORT}/`));

async function initializeServices() {
    await initializeRabbitMQ();
    rabbitConn = getConnection();
    rabbitConn.on("error", () => console.log("Rabbit MQ connection closed unexpectedly"));
    rabbitConn.on("close", initializeServices);
}

(async () => await initializeServices())();