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
      references: {
        model: TestTaker,
        key: "id",
      },
    },
    booking_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Booking,
        key: "id",
      },
    },
  },
  {
    timestamps: false,
  }
);

Code.belongsTo(TestTaker, { foreignKey: "test_taker_id" });
Code.belongsTo(Booking, { foreignKey: "booking_id" });

module.exports = Code;
