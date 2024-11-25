import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../utils/index.js";
import cloudinary from "../config/cloudinary.config.js";

export const signup = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
    const foundEmail = await User.findOne({ email });
    if (foundEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      email,
      fullName,
      password: hashPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      return res.status(201).json({
        success: true,
        message: "Signup success",
        data: {
          _id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          profilePic: newUser.profilePic,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error in signing up",
      });
    }
  } catch (error) {
    console.log(">>> error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const foundEmail = await User.findOne({ email });
    if (!foundEmail) {
      return res.status(400).json({
        success: false,
        message: "Wrong email or password",
      });
    }
    const match = await bcrypt.compare(password, foundEmail.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Wrong email or password",
      });
    }

    generateToken(foundEmail._id, res);
    return res.status(200).json({
      success: true,
      message: "Login success",
      data: {
        _id: foundEmail._id,
        email: foundEmail.email,
        fullName: foundEmail.fullName,
        profilePic: foundEmail.profilePic,
      },
    });
  } catch (error) {
    console.log(">>> error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({
      success: true,
      message: "Logout success",
    });
  } catch (error) {
    console.log(">>> error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required",
      });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Success",
      data: {
        _id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        profilePic: updatedUser.profilePic,
      },
    });
  } catch (error) {
    console.log(">>> error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Success",
      data: req.user,
    });
  } catch (error) {
    console.log(">>> error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
