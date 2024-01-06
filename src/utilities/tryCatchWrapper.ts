import { RequestHandler } from "express";
import { Ierror } from "../errorHandler";

export const tryCatchWrapper = (asyncFunction: RequestHandler): RequestHandler => async (req, res, next) => {

    try {
        await asyncFunction(req, res, next)
    }
    catch (ex) {
        console.log(ex);
        next({ status: 500, message: 'Internal Server Error' } as Ierror)
    }

}