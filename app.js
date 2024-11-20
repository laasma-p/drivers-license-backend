const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth-routes");
const adminRoutes = require("./routes/admin-routes");
const bookingRoutes = require("./routes/booking-routes");
const quizRoutes = require("./routes/quiz-routes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT;

app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/booking", bookingRoutes);
app.use("/quiz", quizRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
