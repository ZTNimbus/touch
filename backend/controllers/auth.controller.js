import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

async function signup(req, res) {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password)
      return res.status(400).send({ message: "All fields must be filled" });

    if (password.length < 6)
      return res
        .status(400)
        .send({ message: "Password must be at least 6 characters" });

    const user = await User.findOne({ email });

    if (user)
      return res.status(400).send({
        message: "This email already belongs to a registered account",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);

      await newUser.save();

      res.status(201).send({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).send({ message: "Invalid User Data" });
    }
  } catch (error) {
    console.log("Register Error", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send({ message: "Invalid Credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect)
      return res.status(400).send({ message: "Invalid Credentials" });

    generateToken(user._id, res);

    res.status(200).send({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Login Error", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

async function logout(req, res) {
  try {
    res.cookie("jwt", "", { maxAge: 0 });

    res.status(200).send({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Logout Error", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

async function updateProfile(req, res) {
  const { profilePic } = req.body;

  const userId = req.user._id;
  try {
    if (!profilePic)
      res.status(400).send({ message: "Profile picture is required" });

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    res.status(200).send(updatedUser);
  } catch (error) {
    console.log("Update Error", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

function checkAuth(req, res) {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    console.log("CheckAuth Error", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

export { signup, login, logout, updateProfile, checkAuth };
