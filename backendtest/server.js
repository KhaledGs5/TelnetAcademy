require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); 


const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
});

app.post("/send-email", async (req, res) => {
  const { toEmail, message } = req.body;

  try {
    const sentEmail = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Change Password",
      text: `Message: ${message}`,
    });

  } catch (error) {
    console.error("Error sending email: ", error);
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
