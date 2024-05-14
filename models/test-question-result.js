const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const TestTaker = require("./test-taker");
const TestQuestion = require("./test-question");

const TestQuestionResult = sequelize.define(
  "test_question_result",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    test_taker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TestTaker,
        key: "id",
      },
    },
    test_question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TestQuestion,
        key: "id",
      },
    },
    user_selected_answers: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

TestQuestionResult.belongsTo(TestTaker, { foreignKey: "test_taker_id" });
TestQuestionResult.belongsTo(TestQuestion, { foreignKey: "test_question_id" });

module.exports = TestQuestionResult;
