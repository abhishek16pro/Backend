// Data base error have to handle like unique email id if registered then error and all other thing's
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/user.js";
import Account from "../models/account.js";
import Dealer from "../models/Dealer.js";
import Strategy from "../models/strategy.js";
import Logs from "../models/logs.js";
import StgLogs from "../models/stgLog.js";

import crypto from "crypto";
import axios from "axios";
import Redis from "ioredis";
import dotenv from "dotenv";
import account from "../models/account.js";
const client = new Redis({
  password: process.env.redisPass,
  host: process.env.redisHost,
  port: process.env.redisPort,
});

dotenv.config();

export const adminadd = async (req, res) => {
  try {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(422).json({
          stat: "OK",
          Error: "Send the complete details",
          Verified: "false",
          message: "Access Denied",
        });
      }
      const salt = await bcrypt.genSalt();
      const passwordhash = await bcrypt.hash(password, salt);
      const newAdmin = new Admin({ email: email, password: passwordhash });
      await newAdmin.save();
      return res
        .status(201)
        .json({ stat: "OK", Error: "", Verified: "false", message: "Created" });
    } catch (error) {
      console.log(error.message);
      return res.status(403).json({
        stat: "OK",
        Error: error.message,
        Verified: "false",
        message: "Not able to register new admin",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "false",
      message: "Internal Server Problem",
    });
  }
};

export const adminlogin = async (req, res) => {
  try {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(422).json({
          stat: "OK",
          Error: "Send the complete details",
          Verified: "false",
          message: "Access Denied",
        });
      }
      const Admindata = await Admin.findOne({ email: email });
      if (!Admindata) {
        return res.status(400).json({
          stat: "OK",
          Error: "",
          Verified: "false",
          message: "Access Denied",
        });
      }
      const ismatch = await bcrypt.compare(password, Admindata.password);
      if (!ismatch) {
        return res.status(400).json({
          stat: "OK",
          Error: "",
          Verified: "false",
          message: "Access Denied",
        });
      }
      const currentDate = new Date();
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);
      const token = jwt.sign({ id: Admindata._id }, process.env.JWT_SECRET, {
        expiresIn: Math.floor((endOfDay - currentDate) / 1000),
      });
      res.cookie("jwt", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(201).json({
        stat: "OK",
        Error: "",
        Verified: "true",
        message: "token generated",
        token: token,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(403).json({
        stat: "OK",
        Error: error.message,
        Verified: "false",
        message: "Not able to login",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "false",
      message: "Internal Server Problem",
    });
  }
};

export const dealerLogin = async (req, res) => {
  try {
    const DealerId = process.env.DID;
    if (!DealerId) {
      return res.status(400).json({
        stat: "OK",
        Error: "Missing Data",
        Verified: "true",
        message: "Access Denied, Dealer Id is required for Dealer Login",
      });
    }
    const DelearData = await Dealer.findOne({ UserId: DealerId });
    let requestBody = {
      userid: DelearData.UserId,
      password: DelearData.Password,
    };
    let config = {
      headers: {
        Accept: "application/json",
        "User-Agent": "MOSL/V.1.1.0",
        vendorinfo: DelearData.UserId, // required
        ApiKey: DelearData.Api, //required
        SourceId: "WEB",
        ClientLocalIP: "1.2.3.4",
        ClientPublicIP: "1.2.3.4",
        MacAddress: "00:00:00:00:00:00",
        osname: "Windows 10",
        osversion: "10.0.19041",
        devicemodel: "AHV",
        manufacturer: "DELL",
        productname: "Motilal",
        productversion: "2.0",
        browsername: "chrome",
        browserversion: "105.0",
        Authorization: "",
      },
    };
    try {
      const response1 = await axios.post(
        "https://openapi.motilaloswal.com/rest/login/v3/authdirectapi",
        requestBody,
        config
      );
      if (response1.data.status === "ERROR") {
        return res.status(400).json({
          stat: "OK",
          Error: "Broker issue",
          Verified: "true",
          brokeMmessage: `${response1.data.message}`,
          brokeErrorCode: `${response1.data.errorcode}`,
          message: `Broker Login error`,
        });
      }
      // Saving into redis with key auth
      await client.set("auth", String(response1.data.AuthToken));
      const authUpdate = await Dealer.findOneAndUpdate(
        { UserId: DelearData.UserId },
        { $set: { auth: response1.data.AuthToken } },
        { new: true }
      );
      return res.status(201).json({
        stat: "OK",
        Error: "",
        Verified: "true",
        message: "Dealer Login ssuccess",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        stat: "OK",
        Error: error.message,
        Verified: "true",
        message: "Error During the Broker Login",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "Internal Server Problem",
    });
  }
};

export const newClient = async (req, res) => {
  try {
    try {
      const updates = req.body;
      const updatedFields = {};
      const allowedFields = [
        "firstName",
        "lastName",
        "email",
        "contactNumber",
        "UserId",
        "Password",
        "Api",
        "Secret",
        "Pan",
        "t2f",
        "maxLoss",
        "maxProfit",
        "maxLossWaitSecond",
        "mapped",
        "multiplier",
      ];
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          updatedFields[field] = updates[field];
        }
      }
      const {
        firstName,
        lastName,
        email,
        contactNumber,
        UserId,
        Password,
        Api,
        Secret,
        Pan,
        t2f,
        maxLoss,
        maxProfit,
        maxLossWaitSecond,
        mapped,
        multiplier,
      } = req.body;
      // do not store plain cred in db just chnage and store and also update error handling for the case when again regestration come for the unique details
      // const newAccount = new Account({firstName ,lastName ,email,contactNumber,UserId ,Password,Api,Secret,Pan,t2f,maxLoss,maxProfit,maxLossWaitSecond,mapped,multiplier})
      const newAccount = new Account(updatedFields);
      await newAccount.save();
      return res.status(201).json({
        stat: "OK",
        Error: "",
        Verified: "true",
        message: "Account added",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(403).json({
        stat: "OK",
        Error: error.message,
        Verified: "true",
        message: "Not able to add client",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "false",
      message: "Internal Server Problem",
    });
  }
};

export const clientUpdate = async (req, res) => {
  try {
    try {
      const UserId = req.params.UserId;
      const Parent = req.params.Parent;
      const updates = req.body;
      console.log(Parent);
      console.log("Hii");
      if (!UserId) {
        return res.status(400).json({
          stat: "OK",
          Error: "Missing userId",
          Verified: "true",
          message: "Access Denied, UserId is required",
        });
      }
      // console.log(updates);
      const updatedFields = {};
      const allowedFields = [
        "firstName",
        "lastName",
        "email",
        "contactNumber",
        "UserId",
        "Password",
        "Api",
        "Secret",
        "Pan",
        "t2f",
        "maxLoss",
        "maxProfit",
        "maxLossWaitSecond",
        "mapped",
        "multiplier",
        "parent",
      ];

      // update strategy
      await Strategy.updateMany(
        { "mappedAccount.clientId": updates.UserId },
        { $set: { "mappedAccount.$.multiplier": updates.multiplier } }
      );

      //Check for parent field if exist in the coming data then update all parent value in the db as false and current one as true
      // as well as change in all strategy
      if (allowedFields.includes("parent")) {
        let Accounts = await Account.find({ parent: true });
        // console.log("From DB", Accounts);
        if (Accounts.length !== 0) {
          for (const acc in Accounts) {
            const statusUser = await Account.findOneAndUpdate(
              { UserId: Accounts[acc].UserId },
              { $set: { parent: false } },
              { new: true }
            );
          }

          const statusUser = await Account.findOneAndUpdate(
            { UserId: UserId },
            { $set: { parent: true } },
            { new: true }
          );

          // console.log(updates, UserId);
          const Strategies = await Strategy.find({});
          for (const stg in Strategies) {
            // console.log(Strategies[stg]);
            if (Strategies.length !== 0) {
              await Strategy.findOneAndUpdate(
                { name: Strategies[stg].name },
                { $set: { parentAcc: UserId } },
                { new: true }
              );
            }
          }
        }
      }

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          updatedFields[field] = updates[field];
        }
      }
      if (!Object.keys(updatedFields).length) {
        return res.status(400).json({
          stat: "OK",
          error: "No valid fields to update provided.",
          Verified: "true",
          message: "Access Denied, Nothing to update",
        });
      }
      const updatedUser = await Account.findOneAndUpdate(
        { UserId: UserId },
        { $set: updatedFields },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          stat: "OK",
          error: "User not found.",
          Verified: "true",
          message: "Access Denied, Nothing to update",
        });
      }
      return res.status(201).json({
        stat: "OK",
        Error: "",
        Verified: "true",
        message: "Details Updated",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(403).json({
        stat: "OK",
        Error: error.message,
        Verified: "true",
        message: "Not able to update",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "Internal Server Problem",
    });
  }
};

export const tradestatus = async (req, res) => {
  try {
    try {
      const UserId = req.params.UserId;
      if (!UserId) {
        return res.status(400).json({
          stat: "OK",
          Error: "Missing userId",
          Verified: "true",
          message: "Access Denied, UserId is required",
        });
      }

      const newStatus = req.body.active;

      const updatedStatus = await Account.findOneAndUpdate(
        { UserId: UserId },
        { $set: { active: newStatus } },
        { returnOriginal: true }
      );
      if (!updatedStatus) {
        return res.status(409).json({
          stat: "OK",
          error: "Active status update conflict.",
          Verified: "true",
          message: "Access Denied, Nothing to update",
        });
      }
      if (updatedStatus.active == newStatus) {
        return res.status(200).json({
          stat: "OK",
          Error: "",
          Verified: "true",
          message: "No Change in the Account Status",
          "Account Status": updatedStatus.active,
        });
      }
      return res.status(201).json({
        stat: "OK",
        Error: "",
        Verified: "true",
        message: "New Status Updated",
        "Account Status": newStatus,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(403).json({
        stat: "OK",
        Error: error.message,
        Verified: "true",
        message: "Not able to modify",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "Internal Server Problem",
    });
  }
};

export const BulkStatus = async (req, res) => {
  try {
    try {
      const UserIds = req.body.UserIds;
      // if(!UserIds || UserIds.length === 0){
      //     return res.status(400).json({"stat":"OK","Error":"Missing UserIds","Verified":"true","message":"Access Denied, UserIds is required for bulk Change"})
      // }

      const newStatus = req.body.active;

      const updatedStatus = await Account.updateMany(
        { UserId: { $in: UserIds } },
        { $set: { active: newStatus } },
        { multi: true }
      );

      if (updatedStatus.nModified === 0) {
        return res.status(409).json({
          stat: "OK",
          error: "Active status update conflict.",
          Verified: "true",
          message: "Access Denied, Nothing to update",
        });
      }

      const stgs = await Strategy.find({});
      // console.log(stg[0].mappedAccount);
      for (const stg in stgs) {
        let mappedAccount = [];
        const account = await Account.find({ active: true });
        for (const acc in account) {
          let obj = {};
          obj["active"] = account[acc].active;
          obj["clientId"] = account[acc].UserId;
          obj["multiplier"] = account[acc].multiplier;
          mappedAccount.push(obj);
        }
        stgs[stg].mappedAccount = mappedAccount;
        // console.log(stgs[stg]);
        await Strategy.updateOne(
          { _id: stgs[stg]._id },
          { $set: { mappedAccount: mappedAccount } }
        );
      }

      return res.status(201).json({
        stat: "OK",
        Error: "",
        Verified: "true",
        message: "New Status Updated",
        "Account Status": newStatus,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(403).json({
        stat: "OK",
        Error: error.message,
        Verified: "true",
        message: "Not able to modify",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "Internal Server Problem",
    });
  }
};

export const userDetails = async (req, res) => {
  try {
    try {
      const UserId = req.params.UserId;
      if (!UserId) {
        return res.status(400).json({
          stat: "OK",
          Error: "Missing userId",
          Verified: "true",
          message: "Access Denied, UserId is required",
        });
      }
      const user = await Account.findOne(
        { UserId },
        {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          contactNumber: 1,
          UserId: 1,
          Pan: 1,
          maxLoss: 1,
          maxProfit: 1,
          maxLossWaitSecond: 1,
          mapped: 1,
          multiplier: 1,
        }
      );
      if (!user) {
        return res.status(200).json({
          stat: "OK",
          Error: "provide correct UserId",
          Verified: "true",
          message: "User Not found",
          user: user,
        });
      }
      return res.status(200).json({
        stat: "OK",
        Error: "",
        Verified: "true",
        message: "found",
        user: user,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(403).json({
        stat: "OK",
        Error: error.message,
        Verified: "true",
        message: "error during the data processing",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "Internal Server Problem",
    });
  }
};
export const userDelete = async (req, res) => {
  try {
    try {
      const UserId = req.params.UserId;
      if (!UserId) {
        return res.status(400).json({
          stat: "OK",
          Error: "Missing userId",
          Verified: "true",
          message: "Access Denied, UserId is required",
        });
      }
      const user = await Account.findOneAndDelete({ UserId });
      console.log(user);
      if (!user) {
        return res.status(200).json({
          stat: "OK",
          Error: "provide correct UserId",
          Verified: "true",
          message: "User Not found",
          user: user,
        });
      }
      return res.status(200).json({
        stat: "OK",
        Error: "",
        Verified: "true",
        message: `user ${UserId} deleted`,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(403).json({
        stat: "OK",
        Error: error.message,
        Verified: "true",
        message: "error during the data processing",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "Internal Server Problem",
    });
  }
};

export const usersUserId = async (req, res) => {
  try {
    try {
      const UserIds = await Account.find(
        {},
        {
          UserId: 1,
          firstName: 1,
          _id: 1,
          multiplier: 1,
          maxLoss: 1,
          maxProfit: 1,
          maxLossWaitSecond: 1,
          mapped: 1,
          active: 1,
          parent: 1,
        }
      );
      return res.status(200).json({
        stat: "OK",
        Error: "",
        Verified: "true",
        message: "All UserId fetched",
        UserId: UserIds,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(403).json({
        stat: "OK",
        Error: error.message,
        Verified: "true",
        message: "error during the data processing",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "Internal Server Problem",
    });
  }
};

export const getLogs = async (req, res) => {
  try {
    const log = await Logs.find({}, { _id: 0, __v: 0 });
    log.sort((a, b) => new Date(b.time) - new Date(a.time));

    // console.log(log);
    return res.status(201).json({
      stat: "OK",
      Error: "",
      Verified: "true",
      message: "Logs fetched",
      log: log,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "Internal Server Problem",
    });
  }
};

export const getstgLog = async (req, res) => {
  try {
    // console.log(req.body);
    const { stgName } = req.body;
    // console.log(stgName);
    const log = await StgLogs.find({ name: stgName }, { __v: 0 });
    // console.log(log);
    return res.status(201).json({
      stat: "OK",
      Error: "",
      Verified: "true",
      message: "Logs fetched",
      log: log,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      stat: "OK",
      Error: error.message,
      Verified: "true",
      message: "Internal Server Problem",
    });
  }
};
