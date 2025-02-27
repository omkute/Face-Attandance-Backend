import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { response } from "express";

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    const validRoles = ['admin', 'clerk', 'classincharge'];
    if (!validRoles.includes(role?.toLowerCase())) {
      return res.status(400).json({ 
        message: "Invalid role. Must be one of: admin, clerk, classincharge" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role.toLowerCase() // Store role in lowercase for consistency
    });
    
    await newUser.save();

    // Create token with role included
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role // Include role in token
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .json({ 
        message: "User registered successfully", 
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role
        }
      });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// User Login Controller
export const loginUserv1 = async (req, res) => {
  const { email, password } = req.body;
  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        role: existingUser.role // Include role in token
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("role", existingUser.role, { // Correctly set the role cookie
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login successful",
        user: {
          id: existingUser._id,
          email: existingUser.email,
          role: existingUser.role
        },
        token,
      });
  } catch (error) {
    res.status(500).json({ message: "Internal server error from backend", error });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login successful",
        user: {
          id: existingUser._id,
          name: existingUser.name, // Include name in response
          email: existingUser.email,
          role: existingUser.role,
        },
        token,
      });

  } catch (error) {
    console.error("Login error:", error); // ✅ Log the full error for debugging
    return res.status(500).json({
      message: "Internal server error from backend",
      error: error.message || error, // ✅ Ensure error message is captured
    });
  }
};

// User Information Controller
export const getUserInfo = async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  console.log(token);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message || error,
    });
  }
};

// User Logout Controller
export const logoutUser = async ( _ , res) => {
  try {
    return res .status(200)
  .cookie("token", "", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      httpOnly: true, // Ensure it matches how the cookie was originally set
      expires: new Date(0), // Expire the cookie immediately
  })
  
      .json({
        success: true,
        message: "Logout Successful",
      });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};


