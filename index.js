import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import User from "./routes/user.js";
import strategy from "./routes/strategy.js";
import Icici_Order from './routes/Icici_Order.js'
import http from "http";
import cors from "cors";
import Socket from "./websocket.js";
import { consumeQueue } from "./ConsumeQueue.js";
// import { spawn } from 'child_process';

const app = express();
dotenv.config();
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors());

// routes
app.use("/admin", User);
app.use("/strategy", strategy);
app.use("/icici_order", Icici_Order);

// Websocket
const socketserver = http.Server(app);
const socket = Socket(socketserver);
socketserver.listen(4000);
console.log(`Websocket is running on port ${process.env.WebsocketPort} at ${new Date().toLocaleString()}`);

const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    app.listen(PORT, () => console.log(`server running at http://localhost:${PORT} at ${new Date().toLocaleString()}`));
    await consumeQueue();

  })
  .catch((error) => console.log(`${error} did not connect`));

