import { parse } from "cookie"
import { signedCookie } from "cookie-parser"
import { verify } from "jsonwebtoken"
import { Response } from "supertest"
import { env } from "../env"

/**
 * checks if header contains valid accessToken and return email if token is valid
 */
export const containsValidAccessTokenCookie = (response: Response) => {

    // get cookies header
    const cookieHeader = response.headers['set-cookie']

    if (!cookieHeader) throw Error("no cookie headers are present in response")

    // get first cookie
    const cookies = parse(cookieHeader[0])

    if (!cookies.accessToken) throw Error("doesn't contain accessToken cookie")

    // unsign the signedCookie
    const accessToken = signedCookie(decodeURIComponent(cookies.accessToken), env.COOKIE_PARSER_SECRET)

    if (!accessToken) throw Error("could not retrieve accessToken after parsing signedCookie")

    // verify jwt
    const payload = verify(accessToken, env.JWT_SECRET)

    if ("string" === typeof payload) throw Error("jwt payload doesn't contain email")

    return payload.email
}