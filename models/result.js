const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Result = sequelize.define(
  "result",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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

module.exports = Result;
