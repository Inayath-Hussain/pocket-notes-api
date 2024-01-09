import { RequestHandler } from "express"
import { decode } from "jsonwebtoken"
import { Ierror } from "../errorHandler"

export const decodeJWT: RequestHandler = async (req, res, next) => {
    const payload = decode(req.signedCookies.accessToken)

    if (payload === null ||
        "string" === typeof payload ||
        payload.email === undefined) return next({ status: 401, message: "Invalid accessToken." } as Ierror)

    req.email = payload.email
    next();
}