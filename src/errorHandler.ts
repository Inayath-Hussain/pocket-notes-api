import { ErrorRequestHandler } from "express";
import Debug from 'debug'

const debug = Debug('pocket-notes:error handler');

export interface Ierror {
    status: number
    message: string
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    debug(err);
    res.contentType('application/json')
    res.status(err.status).json({ message: err.message })
}