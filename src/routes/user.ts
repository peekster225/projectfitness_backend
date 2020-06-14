
import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();
//Get basic account information
router.get('/', checkJwt, UserController.info);


export default router;