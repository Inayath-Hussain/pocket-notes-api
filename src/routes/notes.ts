import { Router } from "express";
import { addNote, createNote, getNotes } from "../controllers/notes";
import { decodeJWT } from "../middleware/decodeJWT";
import { protectedRoute } from "../middleware/protectedRoute";
import { tryCatchWrapper } from "../utilities/tryCatchWrapper";
import { validateCreateNoteBody, validateUpdateNoteBody } from "../middleware/notes";
import { checkIfUserExists } from "../middleware/checkIfUserExists";

export const notesRouter = Router();


notesRouter.get('/', protectedRoute, decodeJWT, checkIfUserExists);     //middlewares
notesRouter.get('/', tryCatchWrapper(getNotes));    // controller



notesRouter.post('/', protectedRoute, decodeJWT, checkIfUserExists, validateCreateNoteBody);    // middlewares
notesRouter.post('/', tryCatchWrapper(createNote));     // controller


notesRouter.patch('/', protectedRoute, decodeJWT, checkIfUserExists, validateUpdateNoteBody);     // middlewares
notesRouter.patch('/', tryCatchWrapper(addNote));       // controller