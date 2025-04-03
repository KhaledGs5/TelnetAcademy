const Notification = require("../models/notification.model");
const User = require("../models/user.model");


const callForTrainers = async (req, res) => { 
    try {
        const { message } = req.body;

        const trainers = await User.find({ role: { $in: ["trainer", "trainee_trainer", "trainee"] } });

        if (trainers.length === 0) {
            return res.status(404).json({ success: false, message: "No trainers found" });
        }
        const notifications = trainers.map(trainer => ({
            message,
            recipient: trainer._id,
        }));
        trainers.forEach(trainer => {
            req.io.to(trainer._id.toString()).emit("newNotification");
        });
        await Notification.insertMany(notifications);
        res.status(201).json({ success: true, message: "Notifications sent to all trainers!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error sending notifications" });
    }
};

const notifyManagers = async (req, message) => {
    try {
      const managers = await User.find({ role: "manager" });
  
      if (managers.length === 0) {
        console.log("No managers found for notification.");
        return;
      }
  
      const notifications = managers.map(manager => ({
        message,
        recipient: manager._id,
      }));
  
      managers.forEach(manager => {
        req.io.to(manager._id.toString()).emit("newNotification");
      });
  
      await Notification.insertMany(notifications);
    } catch (error) {
      console.error("Error sending notifications to managers:", error);
    }
  };


module.exports = {callForTrainers, notifyManagers}