import fs from 'fs';
import path from 'path';

const isDocker = process.env.DOCKER;

const loadDockerSecrets = () => {
  const secretsPath = '/run/secrets/';
  const secrets = fs.readdirSync(secretsPath);

  secrets.forEach((secret) => {
    const secretValue = fs.readFileSync(path.join(secretsPath, secret), 'utf8').trim();
    process.env[secret] = secretValue;
  });
};

if (isDocker) {
  loadDockerSecrets();
} else {
  require('dotenv').config();
}