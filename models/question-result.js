const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const TestTaker = require("./test-taker");
const Question = require("./question");

const QuestionResult = sequelize.define(
  "question_result",
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
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Question,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    user_selected_answers: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    indexes: [
      {
        fields: ["test_taker_id"],
      },
      {
        fields: ["question_id"],
      },
      {
        fields: ["is_correct"],
      },
    ],
  }
);

QuestionResult.belongsTo(TestTaker, { foreignKey: "test_taker_id" });
QuestionResult.belongsTo(Question, { foreignKey: "question_id" });

module.exports = QuestionResult;
