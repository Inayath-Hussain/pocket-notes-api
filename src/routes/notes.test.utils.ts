import { serialize } from "cookie"
import { createHmac } from "crypto"
import { sign } from 'jsonwebtoken'
import { env } from '../env'
import { createAccessToken } from "../utilities/createAccessToken"
import { Notes, INotesSchema } from "../models/notes"
import { User } from "../models/user"

type IValidOptions = "valid" | "invalid"

/**
 * returns a accessToken signed cookie
 */
export const getAccessTokenCookie = (email: string, type: IValidOptions) => {
    const accessToken = type === "valid" ? createAccessToken(email) : _getInvalidAccessToken(email);

    const signedAccessToken = 's:' + _signUsingCookieParserSecret(accessToken)

    const cookie = serialize("accessToken", signedAccessToken, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000) })

    return cookie
}



const _getInvalidAccessToken = (email: string) => {
    const payload = { email }

    return sign(payload, "dummy secret key");
}


const _signUsingCookieParserSecret = (accessToken: string) => {

    const secret = env.COOKIE_PARSER_SECRET

    if ('string' != typeof secret) throw new TypeError("Secret string must be provided.");

    return accessToken + '.' + createHmac('sha256', secret)
        .update(accessToken)
        .digest('base64')
        .replace(/\=+$/, '');

}

/**
 * saves test user credentials in mongodb-memory-server 
 */
export const addDummyUserToMongoDB = async (email: string, username: String, password: string) => {

    const user = new User({ email, username, password })

    await user.save();
}


/**
 * adds test user and notes document to mongodb-memory-server
 */
export const addDummyNotesToMongoDB = async (email: string, groupName: string, notes: INotesSchema["notes"]) => {

    const user = await User.findOne({ email })

    if (user === null) throw Error(`user with email - ${email} doesn't exist in mongodb-memory-server`)

    const newNotes = new Notes({
        groupName,
        notes,
        owner: user._id,
        groupColor: "#0047FF"
    })

    await newNotes.save()

    return;
}


/**
 * if dummy notes was saved to mongodb-memory-server then returns that data else null
 */
export const getSavedDummyNotesFromMongoDB = async (email: string) => {

    const user = await User.findOne({ email })

    if (!user) throw Error("provided email doesn't exist.")

    const notes = await Notes.find({ owner: user._id }).select({ owner: 0, _id: 0, __v: 0 }).exec()

    return notes
}


/**
 * deletes all documents in notes collection
 */
export const clearNotesCollection = async () => {

    const notesClearResult = await Notes.collection.deleteMany()

    console.log(notesClearResult)

}



export const getSavedNotesFromMongoDB = async () => {

    const notes = await Notes.find().populate("owner").exec()

    return notes
}