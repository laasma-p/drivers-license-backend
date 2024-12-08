const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Code = require("../models/code");
const TestTaker = require("../models/test-taker");
const Booking = require("../models/booking");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/time-slots", async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching the bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/test-takers", async (req, res) => {
  const { bookingId } = req.query;

  try {
    const testTakers = await TestTaker.findAll({
      where: { booking_id: bookingId },
    });

    res.status(200).json(testTakers);
  } catch (error) {
    console.error("Error fetching test takers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/generate-codes", async (req, res) => {
  const { bookingId } = req.body;

  try {
    const testTakers = await TestTaker.findAll({
      where: { booking_id: bookingId },
    });

    if (testTakers.length === 0) {
      return res.status(400).json({ error: "No test takers for this test" });
    }

    const codes = [];
    for (const testTaker of testTakers) {
      const generatedCode = generateRandomCode();
      const savedCode = await Code.create({
        generated_code: generatedCode,
        test_taker_id: testTaker.id,
        booking_id: bookingId,
      });

      codes.push(savedCode);
    }

    res.status(200).json(codes);
  } catch (error) {
    console.error("Error saving the generated codes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const generateRandomCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
};

router.post("/regenerate-code", async (req, res) => {
  const { testTakerId } = req.body;

  try {
    const testTaker = await TestTaker.findByPk(testTakerId);

    if (!testTaker) {
      return res.status(404).json({ error: "Test taker not found" });
    }

    const newCode = generateRandomCode();
    const savedCode = await Code.create({
      generated_code: newCode,
      test_taker_id: testTakerId,
      booking_id: testTaker.booking_id,
    });

    res.status(200).json(savedCode);
  } catch (error) {
    console.error("Error regenerating the code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify-code", async (req, res) => {
  const enteredCode = req.body.code;

  try {
    const codeExists = await Code.findOne({
      where: { generated_code: enteredCode },
    });

    if (!codeExists) {
      return res.status(404).json({ error: "Invalid code" });
    }

    const testTaker = await TestTaker.findOne({
      where: { id: codeExists.test_taker_id },
    });

    if (!testTaker) {
      return res.status(404).json({ error: "Test taker not found" });
    }

    if (testTaker.auth_code && testTaker.auth_code === enteredCode) {
      return res
        .status(400)
        .json({ error: "Code already in use for the test" });
    }

    await testTaker.update({ auth_code: enteredCode });

    const token = jwt.sign({ userId: testTaker.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Code verified and assigned to the test taker successfully",
      token: token,
      userId: testTaker.id,
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
