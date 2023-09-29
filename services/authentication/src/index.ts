import './utilities/config-secrets';
import express from 'express';
import sanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import authService from './middleware/auth-service';


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

app.get('/', (req, res) => res.send('Hello, TypeScript! This is auth service.'));

app.listen(PORT, () => console.log(`Authentication service running at http://localhost:${PORT}/`));