const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
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

const adminRoutes = require("./app/routes/admin.routes");
app.use("/api", adminRoutes);

// Automatic Mail Sending ..........

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
});

app.post("/password-reset", async (req, res) => {
  const { toEmail, message } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Change Password",
      text: `Message: ${message}`,
    });

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

// Fetch All Users from excel to mongoDB
const User = require("./app/models/user.model");
app.post("/api/uploadUsers", async (req, res) => {
  const data = req.body.data;
  console.log('Received data:', data);

  try {
    await User.insertMany(data);
    res.status(200).send('Data inserted successfully');
  } catch (error) {
    res.status(500).send('Error inserting data');
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
