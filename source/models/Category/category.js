import { Schema, model } from "mongoose";

const CategorySchema = Schema({
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
        {
            timestamps: true
        }
)

export default model('Category', CategorySchema);
