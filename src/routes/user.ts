import { Router } from "express";
import { loginController } from "../controllers/login";
import { signUpController } from "../controllers/signup";
import { validEmailField, validSignupBodyFields } from "../middleware/signup";
import { validateLoginBody } from "../middleware/login";
import { tryCatchWrapper } from "../utilities/tryCatchWrapper";


export const userRouter = Router();


userRouter.post('/login', validateLoginBody, validEmailField)
userRouter.post('/login', tryCatchWrapper(loginController))


userRouter.post('/signup', validSignupBodyFields, validEmailField)
userRouter.post('/signup', tryCatchWrapper(signUpController))