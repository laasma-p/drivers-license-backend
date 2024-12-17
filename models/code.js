const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const TestTaker = require("./test-taker");
const Booking = require("./booking");

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
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Booking,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    timestamps: false,
  }
);

Code.belongsTo(TestTaker, { foreignKey: "test_taker_id" });
Code.belongsTo(Booking, { foreignKey: "booking_id" });

module.exports = Code;
