import express from 'express';
import morgan from 'morgan';
import Debug from 'debug';
import cookieParser from 'cookie-parser';
import { env } from './env';
import { connectToMongoDB } from './db';
import { errorHandler } from './errorHandler';
import { userRouter } from './routes/user';

const debug = Debug('pocket-notes:server')

const app = express()
const PORT = env.PORT


// middlewares
app.use(cookieParser(env.COOKIE_PARSER_SECRET));
app.use(morgan('dev'));

app.use(express.json())  // identify and parse req.body present in json format
app.use(express.urlencoded({ extended: false }))  // identify and parse req.body present in urlEncoded format


// routes
app.use('/user', userRouter)


// error handler

app.use(errorHandler)

async function main() {

    // database connection
    await connectToMongoDB()
    app.listen(PORT, () => {
        debug('listening on PORT', PORT);
    })

}

main()

