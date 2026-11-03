import express from "express";
import userController from "../controller/userController.js";

const router = express.Router();

router.post("/addUser", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/allUser", userController.getAllUsers);

export default router;
