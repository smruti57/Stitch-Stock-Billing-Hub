const express  = require("express");
const jwt      = require("jsonwebtoken");
const { ValidationError, UniqueConstraintError } = require("sequelize");
const User     = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "shopflow_dev_secret";
if (!process.env.JWT_SECRET) {
  console.warn("⚠  JWT_SECRET is not set. Using default development secret.");
}

const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:        user.id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      createdAt: user.createdAt,
    },
  });
};

const handleAuthError = (err, res) => {
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      message: "Email already exists. Please login or use a different email.",
    });
  }

  if (err instanceof ValidationError) {
    const message = err.errors.map((error) => error.message).join(" ");
    return res.status(400).json({ success: false, message });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message,
  });
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields required." });

    const exists = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (exists)
      return res.status(409).json({
        success: false,
        message: "Email already exists. Please login or use a different email.",
      });

    const user = await User.create({ name, email: email.toLowerCase().trim(), password });
    sendToken(user, 201, res);
  } catch (err) {
    handleAuthError(err, res);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required." });

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials." });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account deactivated." });

    sendToken(user, 200, res);
  } catch (err) {
    handleAuthError(err, res);
  }
});

router.get("/me", protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

router.post("/logout", (req, res) => {
  // Token is managed client-side; server-side logout just confirms success
  res.status(200).json({ success: true, message: "Logged out successfully." });
});

router.post("/refresh", protect, async (req, res) => {
  try {
    // Issue a new token for the authenticated user
    const newToken = signToken(req.user.id);
    res.status(200).json({
      success: true,
      token: newToken,
      user: {
        id:        req.user.id,
        name:      req.user.name,
        email:     req.user.email,
        role:      req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
