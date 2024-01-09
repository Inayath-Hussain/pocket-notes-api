import { Schema, InferSchemaType, model } from 'mongoose'


const noteSchema = new Schema({
    content: { type: String, required: true },
    created_at: { type: Date, required: true }
}, { _id: false })

export const groupColorOptions = ["#B38BFA", "#FF79F2", "#43E6FC", "#F19576", "#0047FF", "#6691FF"] as const

const groupSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },

    groupName: {
        type: String,
        required: true
    },

    groupColor: {
        type: String,
        enum: groupColorOptions,
        required: true
    },

    notes: [noteSchema]
})

type IGroupSchema = InferSchemaType<typeof groupSchema>

type INoteSchema = InferSchemaType<typeof noteSchema>

export interface INotesSchema extends Omit<IGroupSchema, "notes"> {
    notes: INoteSchema[]
}

export const Notes = model('note', groupSchema);