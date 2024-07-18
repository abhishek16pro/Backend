import express from "express";
import * as strategy from "../controllers/strategy.js";
import jwtToken from "../middleware/Jwt.js";
const router = express.Router();

// Strategy routes

// Post Routes
router.post('/add', jwtToken, strategy.addStrategy);
router.post('/addTag', jwtToken, strategy.addTag);
router.post('/updateTag', jwtToken, strategy.updateTag);
router.post('/update/:_id', jwtToken, strategy.updateStrategy);
router.post('/sqOffByClientCode', jwtToken, strategy.sqOffByClientCode);

router.post('/loadStrategy/:_id', jwtToken, strategy.loadStrategy);
router.post('/unloadStrategy/:_id', jwtToken, strategy.unloadStrategy);
router.post('/loadAllStrategy', jwtToken, strategy.loadAllStrategy);


//get Routes 
router.get('/listTag', jwtToken, strategy.StgTagList);
router.get('/list', jwtToken, strategy.strategyList);
router.get('/detail/:_id', jwtToken, strategy.strategyData);



export default router;