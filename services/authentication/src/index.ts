import './utilities/config-secrets';
import express from 'express';
import sanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import authService from './middleware/auth-service';
import { initializeRabbitMQ } from './utilities/config-amqp';


const PORT = 3001;

const configureApp = (middleware?: any[]) =>{
    const app = express();
    
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(sanitize());

    if(middleware){
        app.use(middleware);
    }
    
    return app;
}

const app = configureApp([authService]);

(async ()=>{
    await initializeRabbitMQ();
})();

app.listen(PORT, () => console.log(`Authentication service running at http://localhost:${PORT}/`));