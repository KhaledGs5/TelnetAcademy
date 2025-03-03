const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

connectDB();

app.get("/", (req, res) => {
  res.send("MongoDB is connected!");
});

const userRoutes = require("./app/routes/user.routes");
app.use("/api", userRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
