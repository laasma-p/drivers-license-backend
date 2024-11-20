const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth-routes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT;

app.use("/", authRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
