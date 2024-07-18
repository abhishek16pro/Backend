import mongoose from "mongoose";

const Logs = new mongoose.Schema({
    type: {
        type: String,
    },
    message: {
        type: String,
    },
    time: {
        type: String,
    }
})



mongoose.pluralize(null);
const Log = mongoose.model("logs", Logs);
export default Log;