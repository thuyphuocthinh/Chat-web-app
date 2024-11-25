import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    // console.log(">>> decode: ", decode);
    const userId = decode?.userId;
    const foundUser = await User.findById(userId).select("-password");
    if (!foundUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    req.user = foundUser;
    next();
  } catch (error) {
    console.log(">>> error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
