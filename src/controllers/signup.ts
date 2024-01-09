import { RequestHandler } from "express";
import z from "zod";
import { hash, genSalt } from 'bcrypt'
import { User } from "../models/user";
import { Ierror } from "../errorHandler";
import { createAccessToken } from "../utilities/createAccessToken";


export const signupBodySchema = z.object({
    username: z.string({ required_error: 'Username is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'password is required' })
})

export type ISignupBody = z.infer<typeof signupBodySchema>


export const signUpController: RequestHandler<{}, {}, ISignupBody> = async (req, res, next) => {

    const { email, username, password: passwordFromBody } = req.body

    const emailExists = await User.exists({ email }).exec()

    if (emailExists !== null) {
        return next({ status: 400, message: 'Email Already Exists' } as Ierror)
    }

    const salt = await genSalt(10)

    const password = await hash(passwordFromBody, salt)

    const newUser = new User({ email, username, password })

    await newUser.save()

    const accessToken = createAccessToken(email)

    // setting response cookies
    res.cookie('accessToken', accessToken, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), signed: true })

    return res.status(201).json({ message: 'success' })
}