import { RequestHandler } from "express";
import { Notes, groupColorOptions } from "../models/notes";
import { Ierror } from "../errorHandler";

export const getNotes: RequestHandler = async (req, res, next) => {

    // if request has reached this controller then email is string because in protectedRoute middleware,
    // a bad response is sent if email was anything other than string 
    const email = req.email as string

    const notes = await Notes.aggregate([
        { $unwind: "$owner" },
        { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner" } },
        { $match: { "owner.email": email } },
        { $project: { owner: 0, _id: 0, __v: 0 } }
    ]).exec()

    return res.status(200).json({ data: notes })
}


interface ICreateNoteBody {
    groupName: string
    groupColor: typeof groupColorOptions
}

export const createNote: RequestHandler<{}, {}, ICreateNoteBody> = async (req, res, next) => {

    // if request has reached this controller then email is string because in protectedRoute middleware,
    // a bad response is sent if email was anything other than string 
    // const email = req.email as string

    const { groupName, groupColor } = req.body

    const owner = req.id

    const groupNameExists = await Notes.findOne({ owner, groupName }).exec()

    if (groupNameExists !== null) return next({ status: 400, message: "groupName already exists." } as Ierror)

    const note = new Notes({
        owner,
        groupName,
        groupColor,
        notes: []
    })

    await note.save()

    return res.status(201).json({ message: "success" })
}



interface IAddNoteBody {
    groupName: string,
    content: string
}
export const addNote: RequestHandler<{}, {}, IAddNoteBody> = async (req, res, next) => {

    const owner = req.id
    const { groupName, content } = req.body

    const group = await Notes.findOne({ owner, groupName }).exec()

    if (group === null) return next({ status: 400, message: "group with provided groupName doesn't exist" } as Ierror)

    const created_at = new Date()

    group.notes.push({ content, created_at })

    group.isNew = false

    await group.save()

    return res.status(200).json({ message: "success" })
}