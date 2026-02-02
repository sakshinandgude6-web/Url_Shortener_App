/* eslint-disable no-undef */
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//register api
router.post("/register", async (req, res) => {
  try {
    //accept user and pw
    const { email, password } = req.body;

    //check for null
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    //check already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    //hashing the pw
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    //send response
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error in user registration:", error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
});

//login api
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //check for null
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    //check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    //validate pw
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    //generate jwt token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    //send the response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in user login:", error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
});

//export the modules
module.exports = router;
