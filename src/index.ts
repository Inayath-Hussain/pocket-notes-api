import express from 'express';
import morgan from 'morgan';
import Debug from 'debug';
import { env } from './env';
import { connectToMongoDB } from './db';

const debug = Debug('pocket-notes:server')

const app = express()
const PORT = env.PORT


// middlewares
app.use(morgan('dev'));

app.use(express.json())  // identify and parse req.body present in json format
app.use(express.urlencoded({ extended: false }))  // identify and parse req.body present in urlEncoded format


// database connection

async function main() {

    await connectToMongoDB()
    app.listen(PORT, () => {
        debug('listening on PORT', PORT);
    })

}

main()

