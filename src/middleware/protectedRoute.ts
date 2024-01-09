import { RequestHandler } from "express";
import Debug from 'debug';
import { verify } from "jsonwebtoken"
import { Ierror } from "../errorHandler";
import { env } from "../env";

const debug = Debug("pocket-notes:protected Route");


export const protectedRoute: RequestHandler = (req, res, next) => {

    const accessTokenCookie = req.signedCookies.accessToken

    if (!accessTokenCookie) {
        debug(accessTokenCookie)
        return next({ status: 401, message: "Access Token is missing or invalid." } as Ierror)
    }

    try {
        verify(accessTokenCookie, env.JWT_SECRET)

        next();
    }
    catch (ex) {
        debug(ex);

        next({ status: 401, message: "Access Token is invalid." } as Ierror)
    }
}