import { InferSchemaType, Schema, model } from 'mongoose';


const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
})

export type IUser = InferSchemaType<typeof userSchema>

export const User = model('user', userSchema)