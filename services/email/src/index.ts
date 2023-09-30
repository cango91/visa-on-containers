import './utilities/config-secrets';
import express from 'express';
import sanitize from 'express-mongo-sanitize';
import morgan from 'morgan';

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

const app = configureApp();

app.get('/', (req, res) => res.send('Hello, TypeScript! This is auth service.'));

app.listen(PORT, () => console.log(`Mail service running at http://localhost:${PORT}/`));