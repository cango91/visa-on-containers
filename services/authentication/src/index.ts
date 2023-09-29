import './utilities/config-secrets';
import express from 'express';

const app = express();
const port = 3001;

app.get('/', (req, res) => res.send('Hello, TypeScript!'));

app.listen(port, () => console.log(`Authentication service running at http://localhost:${port}/`));