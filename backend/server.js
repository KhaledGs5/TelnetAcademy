const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
const nodemailer = require("nodemailer");
const connectDB = require("./db");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(cors({ origin: "http://localhost:3000" }));

connectDB();
io.on('connection', (socket) => {
  socket.on('joinRoom', (userId) => {
    socket.join(userId); 
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

module.exports.io = io;

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

const notificationRoutes = require("./app/routes/notification.routes");
app.use("/api", notificationRoutes);

const FormRoutes = require("./app/routes/form.routes");
app.use("/api", FormRoutes);

const ColdFeedbackRoutes = require("./app/routes/coldfeedback.routes");
app.use("/api", ColdFeedbackRoutes);

const HotFeedbackRoutes = require("./app/routes/hotfeedback.routes");
app.use("/api", HotFeedbackRoutes);


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
      text: `Message : ${message}`,
    });

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

app.post("/reject-request", async (req, res) => {
  const { toEmail, message, url } = req.body; 

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Request Rejected",
      html: `
        <p><strong>Message:</strong> ${message}</p>
        <p>You can view the full details <a href="${url}" target="_blank">here</a>.</p>
      `
    });

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});


app.post("/accept-request", async (req, res) => {
  const { toEmail, message, url} = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Request Accepted",
      html: `
        <p><strong>Message:</strong> ${message}</p>
        <p>You can view the full details <a href="${url}" target="_blank">here</a>.</p>
      `
    });

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

app.post("/new_training_status", async (req, res) => {
  const { toEmail, message, url } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Training Status Updated", 
      html: `
        <p><strong>Message:</strong> ${message}</p>
        <p>You can view the full details <a href="${url}" target="_blank">here</a>.</p>
      `
    });

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

app.post("/delete_from_training", async (req, res) => {
  const { toEmail, message, url } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Status Updated", 
      html: `
        <p><strong>Message:</strong> ${message}</p>
        <p>You can view the full details <a href="${url}" target="_blank">here</a>.</p>
      `
    });

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

const {notify} = require("./app/controllers/notification.controllers");
app.post("/send-reminder", async (req, res) => {
  const { toEmail, message, trainee, managerreminded, training, url} = req.body;

  if (!toEmail || !message || !trainee || !managerreminded || !training) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Reminder",
      html: `
        <p><strong>Message:</strong> ${message}</p>
        <p>You can view the full details <a href="${url}" target="_blank">here</a>.</p>
      `
    });
    await notify(trainee, managerreminded, "Request_Accepted", training.toString());

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

app.post("/request-feedback", async (req, res) => {
  const { toEmail, message, url } = req.body;

  if (!toEmail || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Feedback Request",
      html: `
        <p><strong>Message:</strong> ${message}</p>
        <p>You can view the full details <a href="${url}" target="_blank">here</a>.</p>
      `
    });

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

app.post("/role-changed", async (req, res) => {
  const { toEmail, message, url } = req.body;

  if (!toEmail || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Role Changed",
      html: `
        <p><strong>Message:</strong> ${message}</p>
        <p>You can view the full details <a href="${url}" target="_blank">here</a>.</p>
      `
    });

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

app.post("/new-user", async (req, res) => {
  const { toEmail, url, password } = req.body;

  if (!toEmail) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Welcome to Telnet Academy",
      html: `
        <p><strong>Message:</strong> You have been successfully added to the platform.
You can sign in using the link below: </p>
        <p>You password is : ${password}</p>
        <p>You can view the full details <a href="${url}" target="_blank">here</a>.</p>
      `
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

  try {
    await User.insertMany(data);
    res.status(200).send('Data inserted successfully');
  } catch (error) {
    res.status(500).send('Error inserting data');
  }
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
