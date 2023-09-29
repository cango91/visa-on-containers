import './utilities/config-secrets';
import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello, TypeScript! This is the Gateway!'));

app.listen(port, () => console.log(`Gateway API service running at http://localhost:${port}/`));