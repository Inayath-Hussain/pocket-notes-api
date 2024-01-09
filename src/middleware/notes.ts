import { RequestHandler } from "express";
import { ValidationChain, body, checkExact, validationResult } from "express-validator";
import { Ierror } from "../errorHandler";
import { groupColorOptions } from "../models/notes";



const checkIfValid: RequestHandler = (req, res, next) => {

    const result = validationResult(req)

    if (!result.isEmpty()) {
        const message = result.array()[0].msg
        return next({ status: 400, message } as Ierror)
    }

    next();
}


export const validateCreateNoteBody: (ValidationChain | RequestHandler)[] = [

    body("groupName", "Invalid Body. Should contain 'groupName'").trim().escape().exists()
        .isString().isLength({ min: 1, max: 20 }),

    body("groupColor", `Invalid Body. Should contain 'groupColor' Field with any one of the following options - ${groupColorOptions.join(',')}`)
        .trim().escape().exists()
        .isIn(groupColorOptions),

    checkExact(undefined, { message: "Invalid Body. Should contain only groupName and groupColor" }),

    checkIfValid
]



export const validateUpdateNoteBody: (ValidationChain | RequestHandler)[] = [

    body("groupName", "Invalid body. groupName is missing").trim().escape().exists()
        .isString().isLength({ min: 1, max: 20 }),

    body("content", "Invalid body. content is missing").trim().escape().exists()
        .isString().isLength({ min: 1 }),

    checkExact(undefined, { message: "Invalid body. should contain only groupName and content" }),

    checkIfValid
]