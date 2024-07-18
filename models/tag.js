import mongoose from "mongoose";

const StgTag = new mongoose.Schema({
    tag: {
        type: String,
        require: true,
        unique: true,
        max: 50
    },
    mappedAccount: {
        type: [
            {
                active: Boolean,
                clientId: String,
                multiplier: Number
            }
        ],
        required: true
    },

}, { timestamps: true }
)



mongoose.pluralize(null);
const tagSchema = mongoose.model("stgtag", StgTag);
export default tagSchema;