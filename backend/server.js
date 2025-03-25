const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
const nodemailer = require("nodemailer");
const connectDB = require("./db");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});


app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(cors({ origin: "http://localhost:3000" }));

connectDB();
io.on('connection', (socket) => {
  socket.on('joinRoom', (trainerId) => {
    socket.join(trainerId); 
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get("/", (req, res) => {
  res.send("MongoDB is connected!");
});

const userRoutes = require("./app/routes/user.routes");
app.use("/api", userRoutes);

const adminRoutes = require("./app/routes/admin.routes");
app.use("/api", adminRoutes);

const trainingRoutes = require("./app/routes/training.routes");
app.use("/api", trainingRoutes);

const sessionRoutes = require("./app/routes/session.routes");
app.use("/api", sessionRoutes);

const callnotificationRoutes = require("./app/routes/callnotification.routes");
app.use("/api", callnotificationRoutes);

const callFormRoutes = require("./app/routes/form.routes");
app.use("/api", callFormRoutes);

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

app.post("/call-for-trainers", async (req, res) => {
  const { toEmail, message } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Call For Trainers",
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
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
