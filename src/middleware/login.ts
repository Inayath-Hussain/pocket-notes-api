import { RequestHandler } from "express";
import { ValidationChain, body, checkExact, validationResult } from "express-validator";
import { Ierror } from "../errorHandler";
import Debug from 'debug';

const debug = Debug('pocket-notes:login middleware')


const checkLoginBodyHasRequiredFields: RequestHandler = (req, res, next) => {

    const result = validationResult(req)

    if (!result.isEmpty()) {
        debug(result)
        const message = result.array()[0].msg
        return next({ status: 400, message } as Ierror)
    }
    next()
}


export const validateLoginBody: (ValidationChain | RequestHandler)[] = [

    body('email', 'email is required').trim().escape().isString().isLength({ min: 1 }).exists(),
    body('password', 'password is required').trim().escape().isString(),
    checkExact(undefined, { locations: ['body'], message: 'Invalid body. Should contain only email and password' }),
    checkLoginBodyHasRequiredFields
]