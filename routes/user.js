import express from "express";
import * as crud from "../controllers/user.js";
import jwtToken from "../middleware/Jwt.js";
const router = express.Router();

// user routes
router.post("/user/add", jwtToken, crud.newClient);
router.post("/user/update/:UserId/:Parent", jwtToken, crud.clientUpdate);
router.post("/user/status/:UserId", jwtToken, crud.tradestatus);
router.post("/user/delete/:UserId", jwtToken, crud.userDelete);

router.get("/user/details/:UserId", jwtToken, crud.userDetails);
router.get("/user/Users", jwtToken, crud.usersUserId);
router.post("/user/bulkstatus", jwtToken, crud.BulkStatus);

// log routes
router.get("/user/logs", jwtToken, crud.getLogs);
router.post("/user/stgLogs", jwtToken, crud.getstgLog);

// Admin Routes
router.post("/login", crud.adminlogin);
router.post("/add", crud.adminadd);
router.post("/dealerlogin", jwtToken, crud.dealerLogin);

export default router;
