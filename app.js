const express = require("express");
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Code = require("./models/code");
const TestTaker = require("./models/test-taker");
const TestQuestion = require("./models/test-question");
const Question = require("./models/question");
const TestQuestionResult = require("./models/test-question-result");
const QuestionResult = require("./models/question-result");
const Booking = require("./models/booking");
const sequelize = require("sequelize");
const { body, validationResult } = require("express-validator");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.post("/book-a-time", async (req, res) => {
  const { bookingId } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const testTakerId = decoded.userId;

    const booking = await Booking.findByPk(bookingId);
    if (!booking || booking.available_spots === 0) {
      return res.status(400).json({ error: "Not possible to book a slot" });
    }

    await Booking.update(
      { available_spots: booking.available_spots - 1 },
      { where: { id: bookingId } }
    );

    await TestTaker.update(
      { booking_id: bookingId },
      { where: { id: testTakerId } }
    );

    res.status(200).json({ message: "Successfully booked" });
  } catch (error) {
    console.error("Error booking a slot:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/time-slots", async (req, res) => {
  const { date } = req.query;

  try {
    const bookings = await Booking.findAll({ where: { date } });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/generate-code", async (req, res) => {
  try {
    const generatedCode = generateRandomCode();
    const savedCode = await Code.create({ generated_code: generatedCode });
    res.status(200).json({ code: savedCode.generated_code });
  } catch (error) {
    console.error("Error saving the generated code:", error);
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

app.post("/verify-code", async (req, res) => {
  const enteredCode = req.body.code;

  try {
    const codeExists = await Code.findOne({
      where: { generated_code: enteredCode },
    });

    if (!codeExists) {
      return res.status(404).json({ error: "Invalid code" });
    }

    const testTaker = await TestTaker.findOne({
      where: { auth_code: null },
    });

    if (!testTaker) {
      return res
        .status(400)
        .json({ error: "All codes have been used - generate new ones" });
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

app.post("/mark-practice-results", async (req, res) => {
  const { test_taker_id, question_id, user_selected_answers } = req.body;

  try {
    const existingResult = await TestQuestionResult.findOne({
      where: {
        test_taker_id,
        test_question_id: question_id,
      },
    });

    if (existingResult) {
      await existingResult.update({
        user_selected_answers: user_selected_answers,
      });
    } else {
      await TestQuestionResult.create({
        test_taker_id,
        test_question_id: question_id,
        user_selected_answers: user_selected_answers,
      });
    }

    res.status(200).json({ message: "Result marked successfully" });
  } catch (error) {
    console.error("Error marking the answer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/mark-test-results", async (req, res) => {
  const { test_taker_id, question_id, user_selected_answers } = req.body;

  try {
    const question = await Question.findByPk(question_id);

    if (!question) {
      return res.status(404).json({ error: "Question is not found" });
    }

    const correctAnswers = question.correct_statements;
    const isCorrect =
      correctAnswers.length === user_selected_answers.length &&
      correctAnswers.every((answer) => user_selected_answers.includes(answer));

    const existingResult = await QuestionResult.findOne({
      where: {
        test_taker_id,
        question_id: question_id,
      },
    });

    if (existingResult) {
      await existingResult.update({
        user_selected_answers: user_selected_answers,
        is_correct: isCorrect,
      });
    } else {
      await QuestionResult.create({
        test_taker_id,
        question_id: question_id,
        user_selected_answers: user_selected_answers,
        is_correct: isCorrect,
      });
    }

    res.status(200).json({ message: "Result marked successfully" });
  } catch (error) {
    console.error("Error marking the answer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/practice-questions", async (req, res) => {
  try {
    const practiceQuestions = await TestQuestion.findAll();
    res.status(200).json(practiceQuestions);
  } catch (error) {
    console.error("Error fetching practice questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/test-questions", async (req, res) => {
  try {
    const testQuestions = await Question.findAll({
      order: sequelize.literal("RANDOM()"),
      limit: 25,
    });

    res.status(200).json(testQuestions);
  } catch (error) {
    console.error("Error fetching test questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/results/:test_taker_id", async (req, res) => {
  const { test_taker_id } = req.params;

  try {
    const results = await QuestionResult.findAll({
      where: { test_taker_id },
      include: [{ model: Question }],
    });

    const correctQuestions = results.filter(
      (result) => result.is_correct
    ).length;
    const totalQuestions = results.length;
    const mistakes = totalQuestions - correctQuestions;
    const hasPassed = mistakes <= 5;

    if (hasPassed) {
      await TestTaker.update(
        { has_passed: true },
        { where: { id: test_taker_id } }
      );
    }

    const incorrectQuestions = results
      .map((result, index) => {
        return result.is_correct ? null : index;
      })
      .filter((index) => index !== null);

    res.status(200).json({
      correctQuestions,
      totalQuestions,
      mistakes,
      hasPassed,
      incorrectQuestions,
    });
  } catch (error) {
    console.error("Error getting the results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
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

app.post(
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

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
