import mongoose from "mongoose";

const strategySchema = new mongoose.Schema({
    status: {
        type: String,
        require: true,
        default: "Stopped",
        enum: ["Stopped", "Running", "Waiting", "Completed"],
    },
    type: {
        type: String,
        require: true,
        default: "TimeWise",
        enum: ["TimeWise", "Dependent"],
    },
    loaded: {
        type: Boolean,
        default: false,
        require: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return /\S/.test(value);
            },
            message: 'Name cannot be blank'
        },
        trim: true,
        minlength: 1,
        max: 50
    },

    tag: {
        type: String,
        required: true
    },

    parentAcc: {
        type: String,
        required: true,
        default: "DIVK0434"
    },


    startTime: {
        type: String,
        required: true,
        // validate: {
        //     validator: function (value) {
        //         // Use a regular expression to check the format and range
        //         const timePattern = /^(09|10|11|12|13|14|15|16|17):[0-5][0-9]:[0-5][0-9]$/;
        //         return timePattern.test(value);
        //     },
        //     message: 'sqTime should be in the format HH:MM:SS and between 09:00:00 and 15:30:00'
        // }
    },
    endTime: {
        type: String,
        required: true,
        // validate: {
        //     validator: function (value) {
        //         // Use a regular expression to check the format and range
        //         const timePattern = /^(09|10|11|12|13|14|15):[0-5][0-9]:[0-5][0-9]$/;
        //         return timePattern.test(value);
        //     },
        //     message: 'sqTime should be in the format HH:MM:SS and between 09:00:00 and 15:30:00'
        // }
    },
    sqTime: {
        type: String,
        required: true,
        // validate: {
        //     validator: function (value) {
        //         // Use a regular expression to check the format and range
        //         const timePattern = /^(09|10|11|12|13|14|15):[0-5][0-9]:[0-5][0-9]$/;
        //         return timePattern.test(value);
        //     },
        //     message: 'sqTime should be in the format HH:MM:SS and between 09:00:00 and 15:30:00'
        // }
    },
    runOnDay: {
        type: [Number], // Array of numbers
        required: true,
        // validate: {
        //     validator: function (value) {
        //         // Check if all values in the array are between 1 and 5
        //         return value.every(day => day >= 1 && day <= 5);
        //     },
        //     message: 'All values in runOnDay array must be between 1 and 5'
        // }
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

    profitType: {
        type: String,
        enum: ["combinedSL", "premium%", "underlying%", "premiumPoints", "None"],
    },
    profit: {
        type: Number,
        require: true,
        min: 0
    },

    lossType: {
        type: String,
        enum: ["combinedSL", "premium%", "underlying%", "premiumPoints", "None"],
    },
    loss: {
        type: Number,
        require: true,
        max: 0
    },

    exitbuffervalue: {
        type: Number,
        require: true,
        default: 5,
        min: 0
    },
    entrybuffervalue: {
        type: Number,
        require: true,
        default: 5,
        min: 0
    },
    onProfitBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Strategy" // The model name to which it is referring (in this case, "Strategy")
    },
    onLossBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Strategy" // The model name to which it is referring (in this case, "Strategy")
    },
    onLossBookingSqOff: {
        type: [String]
    },
    index: {
        type: String,
        require: true,
        default: "NIFTY",
        enum: ["NIFTY", "FINNIFTY", "BANKNIFTY", "MIDCPNIFTY"],
    },
    pnl: {
        type: Number,
        default: 0,
        required: true
    },
    leg1: {
        added: {
            type: Boolean,
            default: false,
            require: true,
        },
        status: {
            type: String,
            enum: ["pending", "running", "completed"]
        },
        idle: {
            type: Boolean,
            default: false,
        },
        lot: {
            type: Number,
            default: 1,
        },
        tradeType: {
            type: String,
            enum: ["B", "S"],

        },
        optionType: {
            type: String,
            enum: ["CE", "PE"],

        },
        strikeSelectionType: {
            type: String,
            enum: ["premiumClose", "premiumgreater", "premiumless", "ByStrike", "Atm","Sd"],
        },
        strikeSelectionValue: {
            type: Number,
        },
        waitTrade: {
            type: Number
        },
        wtCandleClose: {
            type: Number
        },
        rexCandleCloseTime:{
            type:Number,
            default: 0
        },
        targetType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        targetValue: {
            type: Number
        },
        sLType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        sLValue: {
            type: Number
        },
        trailAfter: {
            type: String
        },
        trailBy: {
            type: String
        },
        onTargetType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onTargetValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onTargetTimes: {
            type: Number,
            min: 0,
            max: 5
        },
        onSLType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onSLValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onSLTimes: {
            type: Number,
            min: 0,
            max: 5
        },
    },
    leg2: {
        added: {
            type: Boolean,
            default: false,
            require: true,
        },
        status: {
            type: String,
            enum: ["pending", "running", "completed"]
        },
        idle: {
            type: Boolean,
            default: false,
        },
        lot: {
            type: Number,
            default: 1,
        },
        tradeType: {
            type: String,
            enum: ["B", "S"],

        }
        ,
        optionType: {
            type: String,
            enum: ["CE", "PE"],

        },
        strikeSelectionType: {
            type: String,
            enum: ["premiumClose", "premiumgreater", "premiumless", "ByStrike", "Atm","Sd"],
        },
        strikeSelectionValue: {
            type: Number,
        },
        waitTrade: {
            type: Number
        },
        wtCandleClose: {
            type: Number
        },
        rexCandleCloseTime:{
            type:Number,
            default: 0
        },
        targetType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        targetValue: {
            type: Number
        },
        sLType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        sLValue: {
            type: Number
        },
        onTargetType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onTargetValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onTargetTimes: {
            type: Number,
            min: 0,
            max: 5
        },
        onSLType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onSLValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        trailAfter: {
            type: String
        },
        trailBy: {
            type: String
        },
        onSLTimes: {
            type: Number,
            min: 0,
            max: 5
        },




    },
    leg3: {
        added: {
            type: Boolean,
            default: false,
            require: true,
        },
        status: {
            type: String,
            enum: ["pending", "running", "completed"]
        },
        idle: {
            type: Boolean,
            default: false,
        },
        lot: {
            type: Number,
            default: 1,
        },
        tradeType: {
            type: String,
            enum: ["B", "S"],

        }
        ,
        optionType: {
            type: String,
            enum: ["CE", "PE"],

        },
        strikeSelectionType: {
            type: String,
            enum: ["premiumClose", "premiumgreater", "premiumless", "ByStrike", "Atm","Sd"],
        },
        strikeSelectionValue: {
            type: Number,
        },
        waitTrade: {
            type: Number
        },
        wtCandleClose: {
            type: Number
        },
        rexCandleCloseTime:{
            type:Number,
            default: 0
        },
        targetType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        targetValue: {
            type: Number
        },
        sLType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        sLValue: {
            type: Number
        },
        trailAfter: {
            type: String
        },
        trailBy: {
            type: String
        },
        onTargetType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onTargetValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onTargetTimes: {
            type: Number,
            min: 0,
            max: 5
        },
        onSLType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onSLValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onSLTimes: {
            type: Number,
            min: 0,
            max: 5
        },




    },
    leg4: {
        added: {
            type: Boolean,
            default: false,
            require: true,
        },
        status: {
            type: String,
            enum: ["pending", "running", "completed"]
        },
        idle: {
            type: Boolean,
            default: false,
        },
        lot: {
            type: Number,
            default: 1,
        },
        tradeType: {
            type: String,
            enum: ["B", "S"],
        },
        optionType: {
            type: String,
            enum: ["CE", "PE"],

        },
        strikeSelectionType: {
            type: String,
            enum: ["premiumClose", "premiumgreater", "premiumless", "ByStrike", "Atm","Sd"],
        },
        strikeSelectionValue: {
            type: Number,
        },
        waitTrade: {
            type: Number
        },
        wtCandleClose: {
            type: Number
        },
        rexCandleCloseTime:{
            type:Number,
            default: 0
        },
        targetType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        targetValue: {
            type: Number
        },
        sLType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        sLValue: {
            type: Number
        },
        trailAfter: {
            type: String
        },
        trailBy: {
            type: String
        },
        onTargetType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onTargetValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onTargetTimes: {
            type: Number,
            min: 0,
            max: 5
        },
        onSLType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onSLValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onSLTimes: {
            type: Number,
            min: 0,
            max: 5
        },




    },
    leg5: {
        added: {
            type: Boolean,
            default: false,
            require: true,
        },
        status: {
            type: String,
            enum: ["pending", "running", "completed"]
        },
        idle: {
            type: Boolean,
            default: false,
        },
        lot: {
            type: Number,
            default: 1,
        },
        tradeType: {
            type: String,
            enum: ["B", "S"],

        },
        optionType: {
            type: String,
            enum: ["CE", "PE"],

        },
        strikeSelectionType: {
            type: String,
            enum: ["premiumClose", "premiumgreater", "premiumless", "ByStrike", "Atm","Sd"],
        },
        strikeSelectionValue: {
            type: Number,
        },
        waitTrade: {
            type: Number
        },
        wtCandleClose: {
            type: Number
        },
        rexCandleCloseTime:{
            type:Number,
            default: 0
        },
        targetType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        targetValue: {
            type: Number
        },
        sLType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        sLValue: {
            type: Number
        },
        trailAfter: {
            type: String
        },
        trailBy: {
            type: String
        },
        onTargetType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onTargetValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onTargetTimes: {
            type: Number,
            min: 0,
            max: 5
        },
        onSLType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onSLValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onSLTimes: {
            type: Number,
            min: 0,
            max: 5
        },




    },
    leg6: {
        added: {
            type: Boolean,
            default: false,
            require: true,
        },
        status: {
            type: String,
            enum: ["pending", "running", "completed"]
        },
        idle: {
            type: Boolean,
            default: false,
        },
        lot: {
            type: Number,
            default: 1,
        },
        tradeType: {
            type: String,
            enum: ["B", "S"],

        },
        optionType: {
            type: String,
            enum: ["CE", "PE"],

        },
        strikeSelectionType: {
            type: String,
            enum: ["premiumClose", "premiumgreater", "premiumless", "ByStrike", "Atm","Sd"],
        },
        strikeSelectionValue: {
            type: Number,
        },
        waitTrade: {
            type: Number
        },
        wtCandleClose: {
            type: Number
        },
        rexCandleCloseTime:{
            type:Number,
            default: 0
        },
        targetType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        targetValue: {
            type: Number
        },
        sLType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        sLValue: {
            type: Number
        },
        trailAfter: {
            type: String
        },
        trailBy: {
            type: String
        },
        onTargetType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onTargetValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onTargetTimes: {
            type: Number,
            min: 0,
            max: 5
        },
        onSLType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onSLValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onSLTimes: {
            type: Number,
            min: 0,
            max: 5
        },




    },
    leg7: {
        added: {
            type: Boolean,
            default: false,
            require: true,
        },
        status: {
            type: String,
            enum: ["pending", "running", "completed"]
        },
        idle: {
            type: Boolean,
            default: false,
        },
        lot: {
            type: Number,
            default: 1,
        },
        tradeType: {
            type: String,
            enum: ["B", "S"],

        },
        optionType: {
            type: String,
            enum: ["CE", "PE"],

        },
        strikeSelectionType: {
            type: String,
            enum: ["premiumClose", "premiumgreater", "premiumless", "ByStrike", "Atm","Sd"],
        },
        strikeSelectionValue: {
            type: Number,
        },
        waitTrade: {
            type: Number
        },
        wtCandleClose: {
            type: Number
        },
        rexCandleCloseTime:{
            type:Number,
            default: 0
        },
        targetType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        targetValue: {
            type: Number
        },
        sLType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        sLValue: {
            type: Number
        },
        trailAfter: {
            type: String
        },
        trailBy: {
            type: String
        },
        onTargetType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onTargetValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onTargetTimes: {
            type: Number,
            min: 0,
            max: 5
        },
        onSLType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onSLValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onSLTimes: {
            type: Number,
            min: 0,
            max: 5
        },




    },
    leg8: {
        added: {
            type: Boolean,
            default: false,
            require: true,
        },
        status: {
            type: String,
            enum: ["pending", "running", "completed"]
        },
        idle: {
            type: Boolean,
            default: false,
        },
        lot: {
            type: Number,
            default: 1,
        },
        tradeType: {
            type: String,
            enum: ["B", "S"],
        },
        optionType: {
            type: String,
            enum: ["CE", "PE"],

        },
        strikeSelectionType: {
            type: String,
            enum: ["premiumClose", "premiumgreater", "premiumless", "ByStrike", "Atm","Sd"],
        },
        strikeSelectionValue: {
            type: Number,
        },
        waitTrade: {
            type: Number
        },
        wtCandleClose: {
            type: Number
        },
        rexCandleCloseTime:{
            type:Number,
            default: 0
        },
        targetType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        targetValue: {
            type: Number
        },
        sLType: {
            type: String,
            enum: ["premiumpoints", "premium%", "underlyingpoints", "underlying%", "clm", "None"],
        },
        sLValue: {
            type: Number
        },
        trailAfter: {
            type: String
        },
        trailBy: {
            type: String
        },
        onTargetType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onTargetValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onTargetTimes: {
            type: Number,
            min: 0,
            max: 5
        },
        onSLType: {
            type: String,
            enum: ["sqOff", "Execute", "reExecute", "reEntry", "None"],
        },
        onSLValue: {
            type: [Number], // Array of numbers
            validate: {
                validator: function (value) {
                    // Check if all values in the array are between 1 and 5
                    return value.every(day => day >= -7 && day <= 7);
                },
                message: 'All values in onTarget or onSL array must be between -7 and 7'
            }
        },
        onSLTimes: {
            type: Number,
            min: 0,
            max: 5
        }
    },

    log: {
        leg1: {
            added: {
                type: Boolean,
                default: false,
                require: true,
            },
            status: {
                type: String,
                require: true,
                default: "Initial",
                enum: ["Initial", "Pending", "Started", "Completed"],
            },
            idle: {
                type: Boolean,
                default: false,
                require: true,
            },
            strikeSelected: {
                type: String,
                default: "",
                require: true,
            },
            strikeValue: {
                type: Number,
                default: 0,
                require: true,
            },
            underlyingValue: {
                type: Number,
                default: 0,
                required: true
            },
            stopLoss: {
                type: Number,
                default: 0,
                required: true
            },
            target: {
                type: Number,
                default: 0,
                required: true
            },
            legPnl: {
                type: Number,
                default: 0,
                required: true
            },
            premiumPnl: {
                type: Number,
                default: 0,
                required: true
            },
            trailAfter: {
                type: String
            },
            trailBy: {
                type: String
            },
            lastCCEpochTime: {
                type: Number
            },
            orderId: {
                type: String,
                default: '',
            },
            SlOrderId: {
                type: String,
                default: '',
            },
            slOrderList: {
                type: [Number],
                default: [],
            },
            reExecuteTime :{
                type: String,
                default: null
            }

        },
        leg2: {
            added: {
                type: Boolean,
                default: false,
                require: true,
            },
            status: {
                type: String,
                require: true,
                default: "Initial",
                enum: ["Initial", "Pending", "Started", "Completed"],
            },
            idle: {
                type: Boolean,
                default: false,
                require: true,
            },
            strikeSelected: {
                type: String,
                default: "",
                require: true,
            },
            strikeValue: {
                type: Number,
                default: 0,
                require: true,
            },
            underlyingValue: {
                type: Number,
                default: 0,
                required: true
            },
            stopLoss: {
                type: Number,
                default: 0,
                required: true
            },
            target: {
                type: Number,
                default: 0,
                required: true
            },
            legPnl: {
                type: Number,
                default: 0,
                required: true
            },
            premiumPnl: {
                type: Number,
                default: 0,
                required: true
            },
            trailAfter: {
                type: String
            },
            trailBy: {
                type: String
            },
            lastCCEpochTime: {
                type: Number
            },
            orderId: {
                type: String,
                default: '',
            },
            SlOrderId: {
                type: String,
                default: '',
            },
            slOrderList: {
                type: [Number],
                default: [],
            },
            reExecuteTime :{
                type: String,
                default: null
            }
        },
        leg3: {
            added: {
                type: Boolean,
                default: false,
                require: true,
            },
            status: {
                type: String,
                require: true,
                default: "Initial",
                enum: ["Initial", "Pending", "Started", "Completed"],
            },
            idle: {
                type: Boolean,
                default: false,
                require: true,
            },
            strikeSelected: {
                type: String,
                default: "",
                require: true,
            },
            strikeValue: {
                type: Number,
                default: 0,
                require: true,
            },
            underlyingValue: {
                type: Number,
                default: 0,
                required: true
            },
            stopLoss: {
                type: Number,
                default: 0,
                required: true
            },
            target: {
                type: Number,
                default: 0,
                required: true
            },
            legPnl: {
                type: Number,
                default: 0,
                required: true
            },
            premiumPnl: {
                type: Number,
                default: 0,
                required: true
            },
            trailAfter: {
                type: String
            },
            trailBy: {
                type: String
            },
            lastCCEpochTime: {
                type: Number
            },
            orderId: {
                type: String,
                default: '',
            },
            SlOrderId: {
                type: String,
                default: '',
            },
            slOrderList: {
                type: [Number],
                default: [],
            },
            reExecuteTime :{
                type: String,
                default: null
            }
        },
        leg4: {
            added: {
                type: Boolean,
                default: false,
                require: true,
            },
            status: {
                type: String,
                require: true,
                default: "Initial",
                enum: ["Initial", "Pending", "Started", "Completed"],
            },
            idle: {
                type: Boolean,
                default: false,
                require: true,
            },
            strikeSelected: {
                type: String,
                default: "",
                require: true,
            },
            strikeValue: {
                type: Number,
                default: 0,
                require: true,
            },
            underlyingValue: {
                type: Number,
                default: 0,
                required: true
            },
            stopLoss: {
                type: Number,
                default: 0,
                required: true
            },
            target: {
                type: Number,
                default: 0,
                required: true
            },
            legPnl: {
                type: Number,
                default: 0,
                required: true
            },
            premiumPnl: {
                type: Number,
                default: 0,
                required: true
            },
            trailAfter: {
                type: String
            },
            trailBy: {
                type: String
            },
            lastCCEpochTime: {
                type: Number
            },
            orderId: {
                type: String,
                default: '',
            },
            SlOrderId: {
                type: String,
                default: '',
            },
            slOrderList: {
                type: [Number],
                default: [],
            },
            reExecuteTime :{
                type: String,
                default: null
            }
        },
        leg5: {
            added: {
                type: Boolean,
                default: false,
                require: true,
            },
            status: {
                type: String,
                require: true,
                default: "Initial",
                enum: ["Initial", "Pending", "Started", "Completed"],
            },
            idle: {
                type: Boolean,
                default: false,
                require: true,
            },
            strikeSelected: {
                type: String,
                default: "",
                require: true,
            },
            strikeValue: {
                type: Number,
                default: 0,
                require: true,
            },
            underlyingValue: {
                type: Number,
                default: 0,
                required: true
            },
            stopLoss: {
                type: Number,
                default: 0,
                required: true
            },
            target: {
                type: Number,
                default: 0,
                required: true
            },
            legPnl: {
                type: Number,
                default: 0,
                required: true
            },
            premiumPnl: {
                type: Number,
                default: 0,
                required: true
            },
            trailAfter: {
                type: String
            },
            trailBy: {
                type: String
            },
            lastCCEpochTime: {
                type: Number
            },
            orderId: {
                type: String,
                default: '',
            },
            SlOrderId: {
                type: String,
                default: '',
            },
            slOrderList: {
                type: [Number],
                default: [],
            },
            reExecuteTime :{
                type: String,
                default: null
            }
        },
        leg6: {
            added: {
                type: Boolean,
                default: false,
                require: true,
            },
            status: {
                type: String,
                require: true,
                default: "Initial",
                enum: ["Initial", "Pending", "Started", "Completed"],
            },
            idle: {
                type: Boolean,
                default: false,
                require: true,
            },
            strikeSelected: {
                type: String,
                default: "",
                require: true,
            },
            strikeValue: {
                type: Number,
                default: 0,
                require: true,
            },
            underlyingValue: {
                type: Number,
                default: 0,
                required: true
            },
            stopLoss: {
                type: Number,
                default: 0,
                required: true
            },
            target: {
                type: Number,
                default: 0,
                required: true
            },
            legPnl: {
                type: Number,
                default: 0,
                required: true
            },
            premiumPnl: {
                type: Number,
                default: 0,
                required: true
            },
            trailAfter: {
                type: String
            },
            trailBy: {
                type: String
            },
            lastCCEpochTime: {
                type: Number
            },
            orderId: {
                type: String,
                default: '',
            },
            SlOrderId: {
                type: String,
                default: '',
            },
            slOrderList: {
                type: [Number],
                default: [],
            },
            reExecuteTime :{
                type: String,
                default: null
            }
        },
        leg7: {
            added: {
                type: Boolean,
                default: false,
                require: true,
            },
            status: {
                type: String,
                require: true,
                default: "Initial",
                enum: ["Initial", "Pending", "Started", "Completed"],
            },
            idle: {
                type: Boolean,
                default: false,
                require: true,
            },
            strikeSelected: {
                type: String,
                default: "",
                require: true,
            },
            strikeValue: {
                type: Number,
                default: 0,
                require: true,
            },
            underlyingValue: {
                type: Number,
                default: 0,
                required: true
            },
            stopLoss: {
                type: Number,
                default: 0,
                required: true
            },
            target: {
                type: Number,
                default: 0,
                required: true
            },
            legPnl: {
                type: Number,
                default: 0,
                required: true
            },
            premiumPnl: {
                type: Number,
                default: 0,
                required: true
            },
            trailAfter: {
                type: String
            },
            trailBy: {
                type: String
            },
            lastCCEpochTime: {
                type: Number
            },
            orderId: {
                type: String,
                default: '',
            },
            SlOrderId: {
                type: String,
                default: '',
            },
            slOrderList: {
                type: [Number],
                default: [],
            },
            reExecuteTime :{
                type: String,
                default: null
            }
        },
        leg8: {
            added: {
                type: Boolean,
                default: false,
                require: true,
            },
            status: {
                type: String,
                require: true,
                default: "Initial",
                enum: ["Initial", "Pending", "Started", "Completed"],
            },
            idle: {
                type: Boolean,
                default: false,
                require: true,
            },
            strikeSelected: {
                type: String,
                default: "",
                require: true,
            },
            strikeValue: {
                type: Number,
                default: 0,
                require: true,
            },
            underlyingValue: {
                type: Number,
                default: 0,
                required: true
            },
            stopLoss: {
                type: Number,
                default: 0,
                required: true
            },
            target: {
                type: Number,
                default: 0,
                required: true
            },
            legPnl: {
                type: Number,
                default: 0,
                required: true
            },
            premiumPnl: {
                type: Number,
                default: 0,
                required: true
            },
            trailAfter: {
                type: String
            },
            trailBy: {
                type: String
            },
            lastCCEpochTime: {
                type: Number
            },
            orderId: {
                type: String,
                default: '',
            },
            SlOrderId: {
                type: String,
                default: '',
            },
            slOrderList: {
                type: [Number],
                default: [],
            },
            reExecuteTime :{
                type: String,
                default: null
            }
        }

    },

},
    {
        timestamps: true,
        versionKey: '__v', // Enable versioning
    })
mongoose.pluralize(null);
const sSchema = mongoose.model("Strategy", strategySchema);
export default sSchema;