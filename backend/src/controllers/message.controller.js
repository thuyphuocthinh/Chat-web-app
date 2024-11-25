import cloudinary from "../config/cloudinary.config.js";
import { getReceiverSocketId, io } from "../config/socket.io.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    return res.status(200).json({
      success: true,
      message: "Success",
      data: filteredUsers,
    });
  } catch (error) {
    console.log("Error:::", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        {
          senderId: userToChatId,
          receiverId: myId,
        },
      ],
    });
    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.log("Error:::", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    // todo: realtime functionality goes here => socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // send message only to the receiver
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.log("Error:::", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
