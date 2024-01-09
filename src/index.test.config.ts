import cookieParser from 'cookie-parser';
import express from 'express';
import { env } from './env';

export function getExpressAppForTest() {

    // initialize app
    const app = express()

    // middlewares
    app.use(cookieParser(env.COOKIE_PARSER_SECRET))
    app.use(express.json())

    console.log('created express app');
    return app
}