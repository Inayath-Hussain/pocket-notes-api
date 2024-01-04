import dotenv from 'dotenv';
import { cleanEnv, str, port } from 'envalid';
dotenv.config()


export const env = cleanEnv(process.env, {
    MONGODB_URI: str(),
    NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
    PORT: port({ default: 3000 })
})


