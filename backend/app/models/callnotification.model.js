const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: String,
  isRead: { type: Boolean, default: false },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
} , { collection: 'callnotification', timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
