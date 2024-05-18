const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const TestQuestion = sequelize.define(
  "test_question",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    test_question_img_url: {
      type: DataTypes.STRING,
      allowNull: false,
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
    test_statement_2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    test_statement_3: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    test_statement_4: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    test_correct_statements: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = TestQuestion;
