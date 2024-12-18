const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Booking = sequelize.define(
  "booking",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    booking_language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    booking_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    available_spots: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    timestamps: false,
    indexes: [
      {
        fields: ["date"],
      },
      {
        fields: ["available_spots"],
      },
    ],
  }
);

module.exports = Booking;
