const express = require("express");
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const Code = require("./models/code");
const TestTaker = require("./models/test-taker");
const TestQuestion = require("./models/test-question");
const Question = require("./models/question");
const TestQuestionResult = require("./models/test-question-result");
const QuestionResult = require("./models/question-result");
const sequelize = require("sequelize");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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
    const existingResult = await QuestionResult.findOne({
      where: {
        test_taker_id,
        question_id: question_id,
      },
    });

    if (existingResult) {
      await existingResult.update({
        user_selected_answers: user_selected_answers,
      });
    } else {
      await QuestionResult.create({
        test_taker_id,
        question_id: question_id,
        user_selected_answers: user_selected_answers,
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

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
