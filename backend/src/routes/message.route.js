import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";
const router = express.Router();

router.use(protectedRoute);
router.get("/users", getUsersForSidebar);
router.get("/:id", getMessages);
router.post("/send/:id", sendMessage);

export default router;
