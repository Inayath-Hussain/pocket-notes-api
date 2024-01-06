import { RequestHandler } from "express";
import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { User } from "../models/user";
import { Ierror } from "../errorHandler";
import { env } from "../env";
// import { signedCookie } from "cookie-parser";



interface ILoginBody {
    email: string
    password: string
}

export const loginController: RequestHandler<{}, {}, ILoginBody> = async (req, res, next) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).exec()

    if (!user) {
        return next({ status: 400, message: "email isn't registered" } as Ierror)
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
        return next({ status: 400, message: 'email and password donot match' })
    }
    else {
        // data in access token
        const payload = { email }

        // generate access token
        const accessToken = sign(payload, env.JWT_SECRET, { expiresIn: '1d', mutatePayload: false })

        console.log(accessToken)

        // setting response cookies
        res.cookie('accessToken', accessToken, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), signed: true })

        return res.status(200).json({ message: 'success' })
    }

}