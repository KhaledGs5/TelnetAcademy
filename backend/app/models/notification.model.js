const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: false },
  message: String,
  isRead: { type: Boolean, default: false },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
} , { collection: 'notification', timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
