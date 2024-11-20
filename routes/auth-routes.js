const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const TestTaker = require("../models/test-taker");
const router = express.Router();

router.post(
  "/register",
  [
    body("first_name").notEmpty().withMessage("First name is required"),
    body("last_name").notEmpty().withMessage("Last name is required"),
    body("birthday").isDate().withMessage("Valid birthday is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone_number").notEmpty().withMessage("Phone number is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body("repeat_password")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords do not match"),
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("post_code")
      .matches(/^\d{4}$/)
      .withMessage("Post code is invalid"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      first_name,
      last_name,
      birthday,
      email,
      phone_number,
      password,
      address,
      city,
      post_code,
    } = req.body;

    try {
      const existingUser = await TestTaker.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newTestTaker = await TestTaker.create({
        first_name,
        last_name,
        birthday,
        email,
        phone_number,
        password: hashedPassword,
        address,
        city,
        post_code,
      });

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Cannot register the user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await TestTaker.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password does not match" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login is successful and JWT is assigned",
      token,
      userId: user.id,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
