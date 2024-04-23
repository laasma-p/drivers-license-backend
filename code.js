const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const Code = sequelize.define(
  "code",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    generated_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Code;
