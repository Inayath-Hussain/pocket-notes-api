import { connect } from "mongoose";
import Debug from 'debug';
import { env } from "./env";

const debug = Debug('pocket-notes:db')

export const connectToMongoDB = async () => {
    return new Promise(async (resolve) => {

        try {
            const connection = await connect(env.MONGODB_URI);
            if (connection) debug('Connected to mongodb');
            resolve(connection);
        }
        catch (ex) {
            debug(ex)
        }

    })
}