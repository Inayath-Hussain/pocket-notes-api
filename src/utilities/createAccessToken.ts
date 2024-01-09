import { sign, JwtPayload } from "jsonwebtoken"
import { env } from "../env"

export interface IAccessTokenPayload extends JwtPayload {
    email: string
}

export const createAccessToken = (email: string) => {
    const payload = { email }

    return sign(payload, env.JWT_SECRET, { expiresIn: "1d" })
}