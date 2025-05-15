const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
const nodemailer = require('nodemailer');
const ical = require('ical-generator').default;
const fs = require('fs');
const path = require('path');
const connectDB = require("./db");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
    credentials: true
  },
  pingInterval: 25000, 
  pingTimeout: 60000,  
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

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${reason}`);
  });
});

module.exports.io = io;

app.get("/", (req, res) => {
  res.send("MongoDB is connected!");
});

const userRoutes = require("./app/routes/user.routes");
app.use("/api", userRoutes);

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

const dynamicFormRoutes = require("./app/routes/dynamicform.routes");
app.use("/api", dynamicFormRoutes);



// Automatic Mail Sending ..........
const User = require("./app/models/user.model");
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
});

const sendCalendarEvent = async (to, eventDetails) => {
  try {
      const calendar = ical({ name: 'My Event Calendar' });
      calendar.method('REQUEST');

      calendar.createEvent({
          start: eventDetails.start,  
          end: eventDetails.end,      
          summary: eventDetails.summary,
          description: eventDetails.description,
          location: eventDetails.location,
          url: eventDetails.url,
      });

      const filePath = path.join(process.cwd(), 'event.ics');
      const icsContent = calendar.toString();
      fs.writeFileSync(filePath, icsContent);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Training Calendar Invite',
        text: 'You have a training session. Please check your calendar.',
        alternatives: [{
          contentType: 'text/calendar; charset="UTF-8"; method=REQUEST',
          content: icsContent,
        }],
        attachments: [{
          filename: 'invite.ics',
          content: icsContent,
          contentType: 'text/calendar',
        }],
      };

      await transporter.sendMail(mailOptions);
      console.log('Calendar event sent successfully');

      fs.unlinkSync(filePath);
  } catch (error) {
      console.error('Error sending calendar event:', error);
  }
};

app.post('/send-calendar-event', async (req, res) => {
  const { recipients, eventDetails } = req.body;
  try {
      await sendCalendarEvent(recipients.join(','), eventDetails);
      res.status(200).json({ message: 'Calendar event sent successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to send calendar event' });
  }
});

app.post("/password-reset", async (req, res) => {
  const { toEmail, message } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "New Password",
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

const formatDaysWithMonth = (dateString, month) => {
    if (!dateString) return "";
  
    const days = dateString.split(" ").map(Number);

    const getDayWithSuffix = (day) => {
      if (day >= 11 && day <= 13) return `${day}th`; 
      const lastDigit = day % 10;
      if (lastDigit === 1) return `${day}st`;
      if (lastDigit === 2) return `${day}nd`;
      if (lastDigit === 3) return `${day}rd`;
      return `${day}th`;
    };
  
    const formattedDays = days.map(getDayWithSuffix);
    const finalDaysFormat = formattedDays.length > 1 
      ? formattedDays.slice(0, -1).join(", ") + " and " + formattedDays.slice(-1) 
      : formattedDays[0];
  
    return `${finalDaysFormat} ${month}`;
};

app.post("/send-trainings-email", async (req, res) => {
  const { toEmail, trainings, message } = req.body;

  if (!toEmail || !trainings) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }


  const html = `
    <p>Dear trainee,</p>
    ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
    <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
      <thead>
        <tr>
          <th style="border: 1px solid #ccc; padding: 8px;">Title</th>
          <th style="border: 1px solid #ccc; padding: 8px;">Trainer</th>
          <th style="border: 1px solid #ccc; padding: 8px;">Date</th>
          <th style="border: 1px solid #ccc; padding: 8px;">Duration</th>
          <th style="border: 1px solid #ccc; padding: 8px;">Location</th>
          <th style="border: 1px solid #ccc; padding: 8px;">Places</th>
        </tr>
      </thead>
      <tbody>
        ${trainings.map(t => `
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">${t.title}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${t.trainerName}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${formatDaysWithMonth(t.date, t.month)}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${t.nbOfHours}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${t.location}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${t.nbOfParticipants}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p>Best regards,<br>Telnet Academy</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "New Trainings !",
      html,
    });

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending trainings email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

app.post("/training-changed", async (req, res) => {
  const { toEmail, message, url } = req.body;

  if (!toEmail || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Training Changed",
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

// Fetch All Users from excel to mongoDB
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
