import { RequestHandler } from "express"
import { validationResult, body, ValidationChain, checkExact } from 'express-validator'
import Debug from 'debug'
import { Ierror } from '../errorHandler'

const debug = Debug('pocket-notes:middleware signup')


const checkBodyHasRequiredFields: RequestHandler = (req, res, next) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
        debug(result);
        const message = result.array()[0].msg
        next({ status: 400, message } as Ierror)
    }

    next();
}

/**
 * checks if body has all and only the required fields.
 */
export const validSignupBodyFields: (ValidationChain | RequestHandler)[] = [
    body('username', 'username is required').trim().escape().isString().isLength({ min: 1 }).exists(),
    body('email', 'email is required').trim().escape().isLength({ min: 1 }).exists(),
    body('password', 'password is required').trim().isString().isLength({ min: 3 }).exists(),

    checkExact(undefined, { locations: ['body'], message: 'Invalid Body. Should contain only username, email and password' }),

    checkBodyHasRequiredFields
]



const checkEmailFieldIsValid: RequestHandler = (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        debug(result)
        next({ status: 400, message: 'Invalid email' })
    }
    next();
}


export const validEmailField: (ValidationChain | RequestHandler)[] = [
    body('email').isEmail(),

    checkEmailFieldIsValid
]