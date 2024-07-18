import StrategySchema from "../models/strategy.js";
import StgTag from "../models/tag.js";
import Account from "../models/account.js";
import Redis from "ioredis";
import cron from "node-cron";
import { json } from "express";

const client = new Redis({
  password: process.env.redisPass,
  host: process.env.redisHost,
  port: process.env.redisPort,
});

export const addStrategy = async (req, res) => {
  try {
    const strategydata = req.body;
    console.log("Data From ui", strategydata)
    if (!strategydata) {
      return res.status(400).json({
        stat: "OK",
        Error: "Missing data",
        Verified: "true",
        message: "Access Denied, Strategy data is required",
      });
    }
    const availFields = {};
    const allowedFields = [
      "name",
      "type",
      "tag",
      "startTime",
      "index",
      "exitbuffervalue",
      "entrybuffervalue",
      "endTime",
      "sqTime",
      "runOnDay",
      "lossType",
      "loss",
      "onStopLoss",
      "onLossBooking",
      "onLossBookingSqOff",
      "profitType",
      "profit",
      "onProfitBooking",
    ];
    const allowedLegFields = [
      "leg1",
      "leg2",
      "leg3",
      "leg4",
      "leg5",
      "leg6",
      "leg7",
      "leg8",
    ];
    for (const field of allowedFields) {
      if (strategydata[field] !== undefined) {
        availFields[field] = strategydata[field];
      }
    }
    for (const field of allowedLegFields) {
      if (strategydata[field] === undefined || strategydata[field] === null) {
        break;
      } else if (strategydata[field] !== undefined) {
        availFields[field] = strategydata[field];
      }
    }

    // Adding logs
    availFields["log"] = {};
    for (const field of allowedLegFields) {
      if (strategydata[field] !== undefined && strategydata[field] !== null) {
        // If the field is defined and not null
        availFields["log"][field] = {
          added: true,
          idle: strategydata[field].idle,
        };

        // Adding trailAfter and trailBy in log of stg
        if (strategydata[field].trailAfter) {
          availFields["log"][field].trailAfter = strategydata[field].trailAfter;
          availFields["log"][field].trailBy = strategydata[field].trailBy;
        }
        if (strategydata[field].wtCandleClose) {
          let startTime = strategydata.startTime;
          const [hours, minutes, seconds] = startTime.split(":");

          const specificTime = new Date();

          // Set the desired time (09:25:00)
          specificTime.setHours(hours);
          specificTime.setMinutes(minutes);
          specificTime.setSeconds(seconds);

          const epochTimeOfSpecificTime = specificTime.getTime();

          const currentEpochTimeInSeconds = Math.floor(
            epochTimeOfSpecificTime / 1000
          );

          availFields["log"][field].lastCCEpochTime = currentEpochTimeInSeconds;
        }
	if(strategydata[field].rexCandleCloseTime){
          availFields["log"][field].rexCandleCloseTime = strategydata[field].rexCandleCloseTime
          availFields["log"][field].reExecuteTime = null
        }
      }
    }

    // console.log(availFields);

    // Adding active mappedAccount
    availFields["mappedAccount"] = {};
    let account = await Account.find({ active: true });
    let mappedAccount = [];
    for (const acc in account) {
      let obj = {};
      obj["active"] = account[acc].active;
      obj["clientId"] = account[acc].UserId;
      obj["multiplier"] = account[acc].multiplier;
      mappedAccount.push(obj);
    }

    availFields.mappedAccount = mappedAccount;

    //Adding Parent
    account = await Account.find({ parent: true });
    // console.log(account[0].UserId);
    availFields.parentAcc = account[0].UserId;
    // console.log(availFields);

    // IF strategydata.onStopLoss === "Execute Same Portfolio" Then we are making a copy of strategy with different name and id of that stg will be go inside the stg which comes from ui and stg type will be Dependent
    if (strategydata.onStopLoss === "Execute Same Portfolio") {
      let id;
      for (let i = 0; i <= strategydata.onLossBooking; i++) {
        if (i === 0) {
          // We are deleteing field name onLossBooking because we don't need in the last strategy
          let copyOfAvailField = JSON.parse(JSON.stringify(availFields));
          copyOfAvailField.onLossBooking = null;
          copyOfAvailField.name = `${availFields.name}_${
            strategydata.onLossBooking - i
          }`;
          copyOfAvailField.type = "Dependent";
          const copyNewStrategy = new StrategySchema(copyOfAvailField);
          console.log("Copy", copyOfAvailField.name, copyNewStrategy._id);
          id = copyNewStrategy._id;
          const savedStrategy = await copyNewStrategy.save();
        } else if (i == strategydata.onLossBooking) {
          availFields["onLossBooking"] = id;
          const newStrategy = new StrategySchema(availFields);
          console.log("Original", newStrategy.name);
          const savedStrategy = await newStrategy.save();
        } else {
          let copyOfAvailField = JSON.parse(JSON.stringify(availFields));
          copyOfAvailField.name = `${availFields.name}_${
            strategydata.onLossBooking - i
          }`;
          copyOfAvailField.type = "Dependent";
          copyOfAvailField["onLossBooking"] = id;
          const copyNewStrategy = new StrategySchema(copyOfAvailField);
          console.log("Copy", copyOfAvailField.name, copyNewStrategy._id);
          id = copyNewStrategy._id;
          const savedStrategy = await copyNewStrategy.save();
        }
      }
    } else {
      const newStrategy = new StrategySchema(availFields);
      console.log("Original", newStrategy.name);
      const savedStrategy = await newStrategy.save();
    }
    return res.status(201).json({
      stat: "OK",
      Error: "",
      Verified: true,
      message: "Strategy saved successfully",
      strategy: "Saved", // Include the saved strategy data in the response
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "error during the data processing",
    });
  }
};

export const addTag = async (req, res) => {
  try {
    const tagData = req.body;
    // console.log(tagData)
    if (!tagData) {
      return res.status(400).json({
        stat: "OK",
        Error: "Missing data",
        Verified: "true",
        message: "Access Denied, Strategy data is required",
      });
    }

    const newTag = new StgTag(tagData);
    // console.log(newTag);

    const saveStgTag = await newTag.save();

    return res.status(201).json({
      stat: "OK",
      Error: "",
      Verified: true,
      message: "Strategy Tag saved successfully",
      strategy: saveStgTag, // Include the saved strategy data in the response
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "error during the data processing",
    });
  }
};

export const updateTag = async (req, res) => {
  try {
    const tagData = req.body;

    // console.log(tagData);
    // console.log("Hii");
    if (!tagData) {
      return res.status(400).json({
        stat: "OK",
        Error: "Missing data",
        Verified: "true",
        message: "Access Denied, Strategy data is required",
      });
    }

    // console.log(tagData.tag);
    const UpdateTag = await StgTag.updateOne(
      { tag: tagData.tag },
      { mappedAccount: tagData.mappedAccount }
    );
    // console.log(UpdateTag);
    const clientData = tagData.mappedAccount.map((account) => ({
      clientId: account.clientId,
      multiplier: account.multiplier,
    }));

    const allStrategy = await StrategySchema.find({});
    // console.log(allStrategy);
    // set cred
    for (let ind = 0; ind < clientData.length; ind++) {
      let cId = clientData[ind].clientId;
      let multiplier = clientData[ind].multiplier;

      const cred = await Account.findOne({ UserId: cId });
      cred.multiplier = multiplier;
      await cred.save();
      await StrategySchema.updateMany(
        { "mappedAccount.clientId": cId },
        { $set: { "mappedAccount.$.multiplier": multiplier } }
      );
    }

    return res.status(201).json({
      stat: "OK",
      Error: "",
      Verified: true,
      message: "Strategy Tag Updated successfully",
      strategy: tagData, // Include the saved strategy data in the response
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "error during the data processing",
    });
  }
};

export const StgTagList = async (req, res) => {
  try {
    // Use Mongoose to find all strategies in the database
    const staregyTagLists = await StgTag.find({}, { _id: 0, mappedAccount: 0 });

    // Check if no strategies were found
    if (staregyTagLists.length === 0) {
      return res.status(404).json({
        stat: "ok",
        error: "",
        Verified: true,
        message: "No strategies found in the database",
      });
    }

    // Send the list of strategies as a JSON response
    return res.status(200).json({
      stat: "ok",
      error: "",
      Verified: true,
      message: "success",
      staregyLists: "Successfully retrieved strategy tag list",
      tagLists: staregyTagLists, // Array of strategies with _id and name fields
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "error during the data processing",
    });
  }
};

export const sqOffByClientCode = async (req, res) => {
  try {
    const strategydata = req.body;

    if (!strategydata) {
      return res.status(200).json({
        stat: "OK",
        Error: '',
        Verified: true,
        message: "No Data Found",
      });
    }

    const allStrategy = await StrategySchema.find({ loaded: true }, '_id name loaded');

    for (let i in allStrategy) {
      console.log(allStrategy[i]._id.toString(), strategydata);
      await client.set(allStrategy[i]._id.toString(), JSON.stringify(strategydata));
    }

    return res.status(200).json({
      stat: "OK",
      Error: '',
      Verified: true,
      message: "Client Going to SqOff",
    });


  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "error during the data processing",
    });
  }
};

export const updateStrategy = async (req, res) => {
  try {
    const strategydata = req.body;
    const _id = req.params._id;
    if (!strategydata) {
      return res.status(400).json({
        stat: "OK",
        Error: "Missing Strategy Id",
        Verified: "true",
        message: "Access Denied, Strategy Id is required",
      });
    }
    if (!strategydata) {
      return res.status(400).json({
        stat: "OK",
        Error: "Missing userId",
        Verified: "true",
        message: "Access Denied, Strategy data is required",
      });
    }
    if (!strategydata.msg) {
      return res.status(400).json({
        stat: "OK",
        Error: "Missing MSG",
        Verified: "true",
        message: "Msg filed  is required",
      });
    }
    const availFields = {};
    const allowedFields = [
      "name",
      "startTime",
      "index",
      "exitbuffervalue",
      "entrybuffervalue",
      "endTime",
      "sqTime",
      "runOnDay",
      "mappedAccount",
      "profit",
      "loss",
      "onProfitBooking",
      "onLossBooking",
      "msg",
    ];
    const allowedLegFields = [
      "leg1",
      "leg2",
      "leg3",
      "leg4",
      "leg5",
      "leg6",
      "leg7",
      "leg8",
    ];
    for (const field of allowedFields) {
      if (strategydata[field] !== undefined) {
        availFields[field] = strategydata[field];
      }
    }
    // let NoLeg = false;
    // for (const field of allowedLegFields) {
    //     if (strategydata[field] === undefined || strategydata[field] === null || NoLeg) {
    //         NoLeg = true;
    //         availFields[field] =
    //         {
    //             "added": false,
    //             "idle": false
    //         }

    //     }
    //     else if (strategydata[field] !== undefined) {
    //         availFields[field] = strategydata[field];
    //     }
    // }

    //Here i am sending changes in the redis to update in rotatestrategy file
    // console.log("data", _id, availFields);
    await client.set(_id, JSON.stringify(availFields));

    // Find and update the strategy by its _id
    const updatedStrategy = await StrategySchema.findByIdAndUpdate(
      _id,
      availFields,
      { new: true, runValidators: true }
    );

    if (!updatedStrategy) {
      return res.status(404).json({
        stat: "OK",
        Error: "Strategy not found",
        Verified: true,
        message: "Strategy with the given ID was not found",
      });
    }

    return res.status(200).json({
      stat: "OK",
      Error: "",
      Verified: true,
      message: "Strategy updated successfully",
      strategy: updatedStrategy,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "error during the data processing",
    });
  }
};

export const strategyList = async (req, res) => {
  try {
    // Use Mongoose to find all strategies in the database
    const staregyLists = await StrategySchema.find(
      {},
      "_id name loaded status"
    );

    // Check if no strategies were found
    if (strategyList.length === 0) {
      return res.status(404).json({
        stat: "ok",
        error: "",
        Verified: true,
        message: "No strategies found in the database",
      });
    }

    // Send the list of strategies as a JSON response
    return res.status(200).json({
      stat: "ok",
      error: "",
      Verified: true,
      message: "success",
      staregyLists: "Successfully retrieved strategy list",
      staregyLists: staregyLists, // Array of strategies with _id and name fields
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "error during the data processing",
    });
  }
};

export const strategyData = async (req, res) => {
  try {
    const _id = req.params._id;
    if (!_id) {
      return res.status(400).json({
        stat: "OK",
        Error: "Missing Strategy Id",
        Verified: "true",
        message: "Access Denied, Strategy Id is required",
      });
    }
    const StrategyD = await StrategySchema.findById(_id);

    if (!StrategyD) {
      return res.status(404).json({
        stat: "OK",
        Error: "Strategy not found",
        Verified: true,
        message: "Strategy with the given ID was not found",
      });
    }

    return res.status(200).json({
      stat: "OK",
      Error: "",
      Verified: true,
      message: "Successfully retrieved strategy",
      strategy: StrategyD,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "error during the data processing",
    });
  }
};

const scheduledJobsMap = new Map();

export const loadStrategy = async (req, res) => {
  try {
    const _id = req.params._id;

    let stg = await StrategySchema.findOne({ _id: _id, loaded: false });

    const currentTime = new Date().toLocaleTimeString("en-US", { hour12: false });

    const currentDay = new Date().getDay();

    // console.log(currentTime, stg.startTime);

    if (stg.type === "TimeWise") {

      if (stg.runOnDay.includes(currentDay)) {

        stg.loaded = true;
        stg.status = "Waiting";
        await stg.save();

        const timeString = stg.startTime;

        if (timeString >= currentTime) {

          const updatedTime = subtractTwoSeconds(stg.startTime);

          const cronExpression = `${updatedTime.newSeconds} ${updatedTime.newMinutes} ${updatedTime.newHours} * * *`; // seconds, minutes, hours
          console.log("Scheduling stg", stg.name, "at", cronExpression);

          const scheduledJob = cron.schedule(cronExpression, () =>
            myScheduledFunction(_id)
          );

          scheduledJobsMap.set(_id, scheduledJob);

        } else {

          const queueName = "rotateStrategy";
          await client.lpush(queueName, JSON.stringify(stg));
          stg.status = "Running";
          await stg.save();
          console.log("Directly pushing into queue", stg.name, new Date());

        }
      } else {
        console.log("Stg is not going to run today");
      }
    }

    return res.status(200).json({
      stat: "OK",
      Error: "",
      Verified: true,
      message: "Strategy Scheduled",
      strategy: _id,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "error during the data processing",
    });
  }
};

async function myScheduledFunction(_id) {

  let StrategyList = await StrategySchema.findOne({ _id: _id });

  const queueName = "rotateStrategy";
  if (StrategyList.type === "TimeWise") {
    try {
      console.log(`Running ${StrategyList.name} at ${new Date()}`);
      await client.lpush(queueName, JSON.stringify(StrategyList));
      StrategyList.status = "Running";
      await StrategyList.save();
    } catch (error) {
      console.log(error);
    }
  }

}

export const unloadStrategy = async (req, res) => {
  try {
    const _id = req.params._id;
    // Retrieve the scheduled job object from the data structure

    const scheduledJob = scheduledJobsMap.get(_id);

    // console.log("Map");
    // scheduledJobsMap.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });

    // console.log(scheduledJob);
    let stg = await StrategySchema.findOne({ _id: _id });
    console.log(_id, stg.name, " Deactivating");
    stg.loaded = false;
    stg.status = "Stopped";
    await stg.save();

    if (scheduledJob) {
      // Cancel the scheduled job
      scheduledJob.stop();
      scheduledJobsMap.delete(_id); // Remove the job from the data structure
      console.log(`Cron job for ${_id} canceled successfully`);
      return res
        .status(200)
        .json({ message: `Cron job for ${_id} canceled successfully` });
    } else {
      console.log(`Cron job for ${_id} not found`);
      return res.status(404).json({ message: `Cron job for ${_id} not found` });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "error during the data processing",
    });
  }
};

export const loadAllStrategy = async (req, res) => {
  try {
    const strategies = await StrategySchema.find({ loaded: false });
    const currentTime = new Date().toLocaleTimeString("en-US", { hour12: false });
    const currentDay = new Date().getDay();

    for (let i = 0; i < strategies.length; i++) {
      const stg = strategies[i];
      
      if (stg.type === "TimeWise") {
        if (stg.runOnDay.includes(currentDay)) {

          stg.loaded = true;
          stg.status = "Waiting";
          await stg.save();

          const timeString = stg.startTime;

          if (timeString >= currentTime) {
            const updatedTime = subtractTwoSeconds(stg.startTime);

            const cronExpression = `${updatedTime.newSeconds} ${updatedTime.newMinutes} ${updatedTime.newHours} * * *`;
            console.log("Scheduling stg", stg.name, "at", cronExpression);

            const scheduledJob = cron.schedule(cronExpression, () =>
              myScheduledFunction(stg._id)
            );

            const stringId = String(stg._id);
            scheduledJobsMap.set(stringId, scheduledJob);

          } else {
            const queueName = "rotateStrategy";

            await client.lpush(queueName, JSON.stringify(stg));
            stg.status = "Running";
            await stg.save();
            console.log("Directly pushing into queue", stg.name);
          }
        } else {
          console.log("Stg is not going to run today");
        }
      }
    }

    return res.status(200).json({
      stat: "OK",
      Error: "",
      Verified: true,
      message: "Strategies Scheduled",
      strategies: "All Scheduled",
    });
  } catch (error) {
    console.log(error);
  }
};

function subtractTwoSeconds(timeString) {
  const [hours, minutes, seconds] = timeString.split(":");
  let totalSeconds = hours * 3600 + minutes * 60 + seconds * 1; // Convert to total seconds
  totalSeconds -= 2; // Subtract two seconds

  // Ensure the result is not negative
  if (totalSeconds < 0) {
    totalSeconds = 0;
  }

  const newHours = Math.floor(totalSeconds / 3600);
  const newMinutes = Math.floor((totalSeconds % 3600) / 60);
  const newSeconds = totalSeconds % 60;

  return {
    newHours,
    newMinutes,
    newSeconds,
  };
}
