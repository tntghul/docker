import User from "../model/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Seed or register admin
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || "Portfolio Admin",
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin"
    });

    const secret = process.env.JWT_SECRET || "portfolio_super_jwt_secret_key_2026_xyz";
    const token = jwt.sign({ userId: user._id, role: user.role, email: user.email }, secret, {
      expiresIn: "7d"
    });

    res.status(201).json({
      message: "Admin account registered successfully!",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error: error.message });
  }
};

// Admin Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Auto-create initial admin if none exists for first run ease
      const count = await User.countDocuments();
      if (count === 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
          name: "Portfolio Admin",
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: "admin"
        });
        const secret = process.env.JWT_SECRET || "portfolio_super_jwt_secret_key_2026_xyz";
        const token = jwt.sign({ userId: newUser._id, role: newUser.role, email: newUser.email }, secret, {
          expiresIn: "7d"
        });
        return res.status(200).json({
          message: "Initial Admin created and logged in successfully!",
          token,
          user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
      }
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Verify password with bcrypt (or plain text fallback if previously created without hash)
    let isMatch = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
      if (isMatch) {
        // Upgrade to hashed password
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const secret = process.env.JWT_SECRET || "portfolio_super_jwt_secret_key_2026_xyz";
    const token = jwt.sign({ userId: user._id, role: user.role, email: user.email }, secret, {
      expiresIn: "7d"
    });

    res.status(200).json({
      message: "Logged in successfully!",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Get current logged-in user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};
