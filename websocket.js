import { Server } from "socket.io";
import StgLog from "./models/stgLog.js";
import Log from "./models/logs.js";
import Redis from "ioredis";
import sSchema from "./models/strategy.js";
//import Log from "./models/stgLog.js";
import account from "./models/account.js";

const client = new Redis({
  password: process.env.redisPass,
  host: process.env.redisHost,
  port: process.env.redisPort,
});

const Socket = (socketServer) => {
  const io = new Server(socketServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(socket.id);

    socket.on("subscribeStg", async ({ stgName }) => {
      console.log("STG is subscribed with " + stgName);

      const sendPositions = async () => {
        const dataForClient = await getLiveStgLogs(stgName);
        socket.emit("getStgLog", dataForClient);
        setTimeout(sendPositions, 1000); // Recursive call with a delay
      };

      sendPositions(); // Start the initial call
    });

    socket.on("subscribeLogs", () => {
      // Using setInterval in this way can lead to multiple overlapping requests.
      // Consider using setTimeout instead, and handle the next request only after the current one is completed.
      const sendLogs = async () => {
        const dataForClient = await getLiveLogs();
        socket.emit("getLog", dataForClient);
        setTimeout(sendLogs, 1000); // Recursive call with a delay
      };

      sendLogs(); // Start the initial call
    });

    // new connection
    socket.on("stgStatus", () => {
      const sendData = async () => {
        const mergedArray = await fetchStgData();

        socket.emit("getStgData", mergedArray);
        setTimeout(sendData, 1000); // Recursive call with a delay
      };

      sendData(); // Start the initial call
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

async function fetchStgData() {
  try {


    // getting data of Column ( name,status, _id, loaded)
    const data = await sSchema.find({}, "name status _id loaded");

    // getting one unique UserId  where parent===true
    const user = await account.findOne({ parent: true }, "UserId multiplier");

    // filter data based on name and UserId
    const table = await StgLog.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $in: ["$name", data.map((item) => item.name)] },
              { $eq: ["$clientId", user.UserId] },
            ],
          },
        },
      },
    ]);

    // get result

    //  logic about pnl
    let data1 = [];

    for (let i = 0; i < table.length; i++) {
      let obj = {};
      obj.name = table[i].name;
      obj.clientId = table[i].clientId;
      obj.leg = table[i].leg;
      obj.symbol = table[i].symbol;
      obj.symbolToken = table[i].symbolToken;
      obj.entryLtp = table[i].entryLtp;
      obj.side = table[i].side;
      obj.lot = table[i].lot;
      obj.exitLtp = table[i].exitLtp;
      obj.orderStatus = table[i].orderStatus;
      obj.entryTime = table[i].entryTime;
      obj.exitTime = table[i].exitTime;

      let lot;
      if (obj.symbol.includes("BANKNIFTY")) lot = process.env.BNLot;
      else if (obj.symbol.includes("FINNIFTY")) lot = process.env.FNLot;
      else if (obj.symbol.includes("MIDCPNIFTY")) lot = process.env.MCNLot;
      else if (obj.symbol.includes("NIFTY")) lot = process.env.NFLot;

      if (table[i].orderStatus.toLocaleLowerCase() === "completed") {
        if (table[i].side === "B") {
          obj.pnl = ((table[i].exitLtp - table[i].entryLtp) * lot * user.multiplier).toFixed(2);
        } else {
          obj.pnl = ((table[i].entryLtp - table[i].exitLtp) * lot * user.multiplier).toFixed(2);
        }
      } else {
        let webSocketData = await client.get(table[i].symbolToken);
        let wbJson = JSON.parse(webSocketData);

        if (table[i].side === "B") {
          obj.pnl = ((wbJson.LTP_Rate - table[i].entryLtp) * lot * user.multiplier).toFixed(2);
        } else {
          obj.pnl = ((table[i].entryLtp - wbJson.LTP_Rate) * lot * user.multiplier).toFixed(2);
        }
      }
      data1.push(obj);
    }

    // Now adding all pnl based on their unique name
    const aggregatedData = {};

    // Iterate through the original array and aggregate PNL values
    data1.forEach((item) => {
      const name = item.name;

      // If the name is not already in the aggregatedData object, initialize it with the current item's pnl
      if (!aggregatedData[name]) {
        aggregatedData[name] = {
          name: name,
          totalPnl: parseFloat(item.pnl),
        };
      } else {
        // If the name is already in the aggregatedData object, add the current item's pnl to the total
        aggregatedData[name].totalPnl += parseFloat(item.pnl);
      }
    });

    // Convert the aggregatedData to an array
    const aggregatedArray = Object.values(aggregatedData);

    // merrging data and aggregatedArray
    const mergedArray = data.map((item) => {
      const matchingItem = aggregatedArray.find(
        (aggItem) => aggItem.name === item.name
      );

      return {
        _id: item._id,
        status: item.status,
        loaded: item.loaded,
        name: item.name,
        totalPnl: matchingItem ? matchingItem.totalPnl : 0,
      };
    });
    return mergedArray;
  } catch (error) {
    console.log(error);
  }
}

async function getLiveStgLogs(stgName) {
  try {
    const table = await StgLog.find({ name: stgName });
    // console.log("Here is my data" + code);
    // console.log(table);

    let data = [];

    for (let i = 0; i < table.length; i++) {
      let obj = {};
      obj.name = table[i].name;
      obj.clientId = table[i].clientId;
      obj.leg = table[i].leg;
      obj.symbol = table[i].symbol;
      obj.symbolToken = table[i].symbolToken;
      obj.entryLtp = table[i].entryLtp;
      obj.side = table[i].side;
      obj.lot = table[i].lot;
      obj.exitLtp = table[i].exitLtp;
      obj.orderStatus = table[i].orderStatus;
      obj.entryTime = table[i].entryTime;
      obj.exitTime = table[i].exitTime;

      let lot;
      if (obj.symbol.includes("BANKNIFTY")) lot = process.env.BNLot;
      else if (obj.symbol.includes("FINNIFTY")) lot = process.env.FNLot;
      else if (obj.symbol.includes("MIDCPNIFTY")) lot = process.env.MCNLot;
      else if (obj.symbol.includes("NIFTY")) lot = process.env.NFLot;

      if (table[i].orderStatus.toLocaleLowerCase() === "completed") {
        if (table[i].side === "B") {
          obj.pnl = ((table[i].exitLtp - table[i].entryLtp) * lot * obj.lot).toFixed(2);
        } else {
          obj.pnl = ((table[i].entryLtp - table[i].exitLtp) * lot * obj.lot).toFixed(2);
        }
      } else {
        let webSocketData = await client.get(table[i].symbolToken);
        let wbJson = JSON.parse(webSocketData);

        if (table[i].side === "B") {
          obj.pnl = ((wbJson.LTP_Rate - table[i].entryLtp) * lot * obj.lot).toFixed(2);
        } else {
          obj.pnl = ((table[i].entryLtp - wbJson.LTP_Rate) * lot * obj.lot).toFixed(2);
        }
      }
      data.push(obj);
    }
    return data;

  } catch (error) {
    console.error("Error fetching data:", error.message);
    return [];
  }
}

async function getLiveLogs() {
  const table = await Log.find({});
  table.sort((a, b) => new Date(b.time) - new Date(a.time));
  return table;
}

export default Socket;