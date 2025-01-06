import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

async function getUsersForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).send(filteredUsers);
  } catch (error) {
    console.log("Get Users Error", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

async function getMessages(req, res) {
  const { id: userToChatId } = req.params;

  try {
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).send(messages);
  } catch (error) {
    console.log("Get Messages Error", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

async function sendMessages(req, res) {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = "";

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

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).send(newMessage);
  } catch (error) {
    console.log("Send Messages Error", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

export { getUsersForSidebar, getMessages, sendMessages };
