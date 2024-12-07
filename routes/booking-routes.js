const express = require("express");
require("dotenv").config();
const TestTaker = require("../models/test-taker");
const Booking = require("../models/booking");
const authenticateJWT = require("../middleware/jwt");
const router = express.Router();

router.get("/time-slots", async (req, res) => {
  const { date } = req.query;

  try {
    const bookings = await Booking.findAll({ where: { date } });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/book-a-time", authenticateJWT, async (req, res) => {
  const { bookingId } = req.body;
  const testTakerId = req.user.userId;

  try {
    const user = await TestTaker.findByPk(testTakerId);

    if (user.booking_id) {
      return res
        .status(400)
        .json({ error: "User already has an active booking" });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking || booking.available_spots === 0) {
      return res.status(400).json({ error: "Not possible to book a slot" });
    }

    await Booking.update(
      { available_spots: booking.available_spots - 1 },
      { where: { id: bookingId } }
    );

    await TestTaker.update(
      { booking_id: bookingId },
      { where: { id: testTakerId } }
    );

    res.status(200).json({ message: "Successfully booked" });
  } catch (error) {
    console.error("Error booking a slot:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/current-booking", authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await TestTaker.findByPk(userId, { include: Booking });

    if (!user || !user.booking_id) {
      return res.status(404).json({ message: "No current booking found" });
    }

    const currentDateTime = new Date();

    const booking = await Booking.findByPk(user.booking_id);

    const bookingDateTime = new Date(`${booking.date}T${booking.time}`);

    if (bookingDateTime <= currentDateTime) {
      await TestTaker.update({ booking_id: null }, { where: { id: userId } });
      return res.status(404).json({ messsage: "No active booking found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching current booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cancel-booking", authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await TestTaker.findByPk(userId);

    if (!user || !user.booking_id) {
      return res.status(400).json({ message: "No booking to cancel" });
    }

    const booking = await Booking.findByPk(user.booking_id);

    await Booking.update(
      { available_spots: booking.available_spots + 1 },
      { where: { id: booking.id } }
    );

    await TestTaker.update({ booking_id: null }, { where: { id: userId } });

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling the booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
