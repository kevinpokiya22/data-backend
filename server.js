require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDb = require("./db/db");
const indexRoutes = require("./routes/indexRoutes");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 4000;
app.use(cookieParser());
// Increase body size limits to allow data URLs from images
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://data-analisys.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", indexRoutes);

// Define a root route
app.get("/", (req, res) => {
  res.send("Hello Data Analysis System ! 😁 🎈");
});

app.listen(port, () => {
  connectDb();

  console.log(`Server is running on port ${port}`);
});
