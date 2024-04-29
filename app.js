const express = require("express");
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const Code = require("./code");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/generate-code", async (req, res) => {
  try {
    const generatedCode = generateRandomCode();
    const savedCode = await Code.create({ generated_code: generatedCode });
    res.status(200).json({ code: savedCode.generated_code });
  } catch (error) {
    console.error("Error saving the generated code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const generateRandomCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
};

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
