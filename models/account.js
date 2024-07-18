import mongoose from "mongoose";

const accountCred = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        default: "client",
        enum: ["client"],
    },
    firstName: {
        type: String,
        require: true,
        max: 30,
        min: 4,
    },
    lastName: {
        type: String,
        max: 30,
        min: 2
    },
    email: {
        type: String,
        require: true,
        max: 50
    },
    contactNumber: {
        type: String,
        require: true,
        max: 10
    },
    UserId: {
        type: String,
        require: true,
        unique: true,
        max: 50
    },
    Password: {
        type: String,
        require: true,
        max: 50
    },
    Api: {
        type: String,
        require: true,
        max: 50
    },
    Secret: {
        type: String,
        require: true,
        max: 50
    },
    Pan: {
        type: String,
        require: true,
        unique: true,
        max: 50
    },
    t2f: {
        type: String,
        require: true,
        max: 50
    },
    multiplier: {
        type: Number,
        default: 1,
        max: 30
    },
    maxLoss: {
        type: Number,
        default: 1,
        min: 0,
        max: 2
    },
    maxProfit: {
        type: Number,
        default: 1,
        min: 0,
        max: 2
    },
    maxLossWaitSecond: {
        type: Number,
        default: 59,
        min: 0,
        max: 60
    },
    mapped: {
        type: Boolean,
        require: true,
        default: true
    },
    login: {
        type: Boolean,
        require: true,
        default: false
    },
    active: {
        type: Boolean,
        require: true,
        default: false
    },
    cred: {
        type: Boolean,
        require: true,
        default: false
    },
    parent: {
        type: Boolean,
        require: true,
        default: false
    }
},
    { timestamps: true }
)

mongoose.pluralize(null);
const account = mongoose.model("cred", accountCred);
export default account;