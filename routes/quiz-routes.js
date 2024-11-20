const express = require("express");
require("dotenv").config();
const TestTaker = require("../models/test-taker");
const TestQuestion = require("../models/test-question");
const Question = require("../models/question");
const TestQuestionResult = require("../models/test-question-result");
const QuestionResult = require("../models/question-result");
const sequelize = require("sequelize");
const router = express.Router();

router.post("/mark-practice-results", async (req, res) => {
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

router.post("/mark-test-results", async (req, res) => {
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

router.get("/practice-questions", async (req, res) => {
  try {
    const practiceQuestions = await TestQuestion.findAll();
    res.status(200).json(practiceQuestions);
  } catch (error) {
    console.error("Error fetching practice questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/test-questions", async (req, res) => {
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

router.get("/results/:test_taker_id", async (req, res) => {
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

module.exports = router;
