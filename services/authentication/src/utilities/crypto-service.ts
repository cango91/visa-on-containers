import crypto from 'crypto';

const { AUTH_HASH_SALT_LENGTH,
    AUTH_HASH_ITERS,
    AUTH_HASH_KEY_LEN,
    AUTH_HASH_DIGEST } = process.env;

export function hashString(string: string): Promise<string> {
    const salt = crypto.randomBytes(Number(AUTH_HASH_SALT_LENGTH)).toString('hex');
    return new Promise((resolve, reject) =>
        crypto.pbkdf2(string,
            salt,
            Number(AUTH_HASH_ITERS),
            Number(AUTH_HASH_KEY_LEN),
            String(AUTH_HASH_DIGEST),
            (err, key) => {
                if (err) {
                    reject(err);
                }
                resolve(`${salt}:${key.toString('hex')}`);
            }));
}

export function compareHash(string: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(':');
    return new Promise((resolve, reject) =>
        crypto.pbkdf2(string,
            salt,
            Number(AUTH_HASH_ITERS),
            Number(AUTH_HASH_KEY_LEN),
            String(AUTH_HASH_DIGEST),
            (err, compKey) => {
                if (err) {
                    reject(err);
                }
                resolve(key === compKey.toString('hex'));
            }));
}