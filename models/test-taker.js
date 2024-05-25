const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const Booking = require("./booking");

const TestTaker = sequelize.define(
  "test_taker",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    post_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    auth_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    has_passed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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

TestTaker.belongsTo(Booking, { foreignKey: "booking_id" });

module.exports = TestTaker;
