import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Log from "./models/logs.js";
import BackupLogs from "./models/logsBackup.js";

const app = express();
dotenv.config();
app.use(express.json());
const PORT = 5000;
let server;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server = app.listen(PORT, () =>
      console.log(`server running at http://localhost:${PORT}`)
    );
  })
  .catch((error) => console.log(`${error} did not connect`));

const backupLogs = async() => {
    try {
        // Retrieve logs from original collection
      const logs = await Log.find()
     // console.log(logs);
      // Save logs into backup collection
      await BackupLogs.insertMany(logs);
      await Log.deleteMany()

      console.log('Backup completed successfully.');
      gracefulShutdown(server)
    } catch (error) {
      console.error('Error occurred during backup:', error);
    } finally {
      // Close connection to MongoDB
      mongoose.disconnect();
    }
}

function gracefulShutdown (server) {
  console.log('Gracefully closing http server')

  try {
    server.close(function (err) {
      if (err) {
        console.error('There was an error', err.message)
        process.exit(1)
      } else {
        console.log('http server closed successfully!')
        process.exit(0)
      }
    })
  } catch (err) {
    console.error('There was an error', err.message)
    setTimeout(() => process.exit(1), 500)
  }
}
backupLogs()
