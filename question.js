const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const Question = sequelize.define(
  "question",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statement_1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correct_statement_answer_1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statement_2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correct_statement_answer_2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statement_3: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correct_statement_answer_3: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statement_4: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    correct_statement_answer_4: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Question;
