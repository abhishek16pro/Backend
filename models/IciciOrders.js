import mongoose from "mongoose";

const data_schema = mongoose.Schema({}, { strict: false });

mongoose.pluralize(null);
const Backup = mongoose.model("IciciOrder", data_schema);
export default Backup;