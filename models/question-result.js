const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

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
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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

module.exports = QuestionResult;
