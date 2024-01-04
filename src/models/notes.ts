import { Schema, InferSchemaType, model } from 'mongoose'


const notesSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },

    notes: [{
        content: { type: String, required: true },
        created_at: { type: String, required: true }
    }],

    test: { type: String }
})

export type INotesSchema = InferSchemaType<typeof notesSchema>


export const Notes = model('note', notesSchema);