import './utilities/config-secrets';
import express from 'express';
import sanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import authService from './middleware/auth-service';
import templateRouter from './routes/email-template-route';

const PORT = 4000;

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

//app.get('/', (req, res) => res.send('Hello, TypeScript! This is email service.'));

app.use('/templates', templateRouter);

app.listen(PORT, () => console.log(`Mail service running at http://localhost:${PORT}/`));