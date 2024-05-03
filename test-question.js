const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const TestQuestion = sequelize.define(
  "test_question",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    test_question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    test_question_description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    test_statement_1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correct_test_statement_answer_1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    test_statement_2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correct_test_statement_answer_2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    test_statement_3: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correct_test_statement_answer_3: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    test_statement_4: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    correct_test_statement_answer_4: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = TestQuestion;
