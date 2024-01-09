import { RequestHandler } from "express";
import { User } from "../models/user";
import { Ierror } from "../errorHandler";

export const checkIfUserExists: RequestHandler = async (req, res, next) => {

    const email = req.email

    const user = await User.findOne({ email }).exec()

    if (user === null) return next({ status: 401, message: "User doesn't exist." } as Ierror)

    req.id = user._id.toString();

    next();
}