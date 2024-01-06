import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, disconnect } from 'mongoose';
import Debug from 'debug'

const debug = Debug('pocket-notes: test db connection')

let mongodb: MongoMemoryServer;

export const mongodbForTests = async () => {

    if (!mongodb) {
        mongodb = await MongoMemoryServer.create()
    }

    const connectToTestDB = async () => {
        const uri = mongodb.getUri()

        try {
            const u = await connect(uri)
            return u
        }
        catch (ex) {
            debug(ex);
            process.exit(1);
        }
    }

    /**
     * disconnects mongoose and stops mongodb-memory-server
     */
    const disconnectTestDB = async () => {
        await disconnect();

        await mongodb.stop()
    }

    return { connectToTestDB, disconnectTestDB }
}