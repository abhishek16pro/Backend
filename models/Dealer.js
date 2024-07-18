import mongoose from "mongoose";

const DealerAcc = new mongoose.Schema({
    UserId :{
        type : String,
        require: true,
        unique : true,
        max : 50
    },
    Password :{
        type : String,
        require: true,
        max : 50
    },
    Api:{
        type : String,
        require: true,
        max : 50
    },
    auth:{
        type : String,
    }
},{ timestamps: true }
)



mongoose.pluralize(null);
const Dealer = mongoose.model("Dealer", DealerAcc);
export default Dealer;