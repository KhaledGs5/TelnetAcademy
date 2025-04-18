const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const Session = require("../models/session.model");
const { io } = require('../../server');
const cron = require('node-cron');

  const notify = async (rec, sen, tp, msg) => {
  try {
  const notification = {
    type: tp,
    message: msg,
    recipient: rec,
  };

  if (sen) {
  notification.sender = sen;
  }

  io.to(rec.toString()).emit("newNotification");
  console.log("Sending notification to user:", notification);
  await Notification.create(notification);
  } catch (error) {
  console.error("Error sending notification to user:", error);
  }
  };

  const notifyUsers = async (sen, tp, msg) => {
    try {
      const users = await User.find({ role: { $in: ["trainer", "trainee_trainer", "trainee"] } });
      users.forEach(user => {
        notify(user._id, sen , tp ,msg);
      });
    } catch (error) {
      console.error("Error sending notification to user:", error);
    }
  }

  const notifyManagers = async (sen, tp, msg) => {
    try {
      const managers = await User.find({ role: "manager" });
      managers.forEach(manager => {
        notify(manager._id, sen , tp ,msg);
      });
    } catch (error) {
      console.error("Error sending notification to user:", error);
    }
  }

  const markReadNotif = async (req,res) => {
    try {
      const { rec, tp, rtp, sen } = req.body;
      const query = {
        recipient: rec,
        type: tp,
      };
      if (sen) {
        query.sender = sen;
      }
      await Notification.updateMany(query, { isRead: true });
      io.to(rec.toString()).emit(rtp);
    } catch (error) {
      console.error("Error mark notification :", error);
    }
  };

  const deleteNotifById = async (id) => {
    try {
      await Notification.findByIdAndDelete({_id : id})
    } catch (error) {
      console.error("Error deleting notif:", error);
    }
  }

  const deleteNotif = async (rec, sen, tp, msg) => {
    try {
      const query = {
        recipient: rec,
        sender: sen,
        type: tp,
        ...(msg && { message: msg })
      };
      console.log("Deleting notifications with query:", query);
      await Notification.deleteMany(query);
    } catch (error) {
      console.error("Error deleting notif:", error);
    }
  };
  

  const deleteNotifFromManagers = async (rec, tp, msg) => {
    try {
      const managers = await User.find({ role: "manager" });
      managers.forEach(manager => {
        deleteNotif(rec ,manager._id , tp, msg);
      });
    } catch (error) {
      console.error("Error deleting notif:", error);
    }
  };

  const deleteNotifFromUser = async (sen, tp, msg) => {
    try {
      const managers = await User.find({ role: "manager" });
      managers.forEach(manager => {
        deleteNotif(manager._id, sen, tp, msg);
      });
    } catch (error) {
      console.error("Error deleting notif:", error);
    }
  }
  
  const getNotifWithType = async (req, res) => {
    try {
      const { rec, tp} = req.body;
      const notifications = await Notification.find({ recipient: rec, type: tp });
      res.status(200).json({ notifications });
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  };

  const getNoReadNotif = async (req, res) => {
    try {
      const { rec } = req.body;
      const unreadNotifications = await Notification.find({ recipient: rec ,isRead: false });
      res.status(200).json({ count: unreadNotifications.length, notifications: unreadNotifications });
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  };

  const getAllNotif = async (req, res) => {
    try {
      const { rec } = req.body;
      const notifications = await Notification.find({ recipient: rec });
      res.status(200).json({ notifications });
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  };

  const deleteNotification = async (req, res) => {
    try {
      const { rec, sen, tp ,msg} = req.body;
      const query = {
        recipient: rec,
        type: tp,
      };
      if (sen) {
        query.sender = sen;
      };
      if (msg) {
        query.message = msg;
      };
      console.log("Deleting notifications with query:", query);
      await Notification.deleteMany(query);
      res.status(200).json({ message: "Notifications deleted successfully." });
    } catch (error) {
      console.error("Error deleting notifications:", error);
      res.status(500).json({ message: "Failed to delete notifications." });
    }
  };

  const notifyRoleChange = async (req, res) => {
    try {
      const { rec, tp, sen ,msg } = req.body;
      const notification = {
        recipient: rec,
        type: tp,
        message: msg,
      };
      if (sen) {
        notification.sender = sen;
      }
    io.to(rec.toString()).emit("newNotification");
    await Notification.create(notification);
    } catch (error) {
      console.error("Error sending notification to user:", error);
    }
  }

  const notifyRoleChangeToManagers = async (req, res) => {
    try {
      const { tp, sen, msg } = req.body;
      const managers = await User.find({ role: "manager" });
  
      managers.forEach(manager => {
        notify(manager._id, sen, tp, msg);
      });
      res.status(200).json({ success: true, message: "Notifications sent to all managers." });
    } catch (error) {
      console.error("Error sending notification to user:", error);
      res.status(500).json({ success: false, message: "Failed to send notifications." });
    }
  };
  

  const getLastSessionDate = async (trainingId) => {
    try {
      const latestSession = await Session.findOne({ training: trainingId })
        .sort({ date: -1 }) 
        .select('date'); 
  
      if (!latestSession) {
        console.log('No sessions found for this training.');
        return null;
      }
  
      console.log('Latest session date:', latestSession.date);
      return latestSession.date;
  
    } catch (error) {
      console.error('Error fetching latest session:', error);
      return null;
    }
  };
  
  cron.schedule('* * * * *', async () => {
    try {
      const trainingIds = await Session.distinct('training');
  
      for (const trainingId of trainingIds) {
        const latestDate = await getLastSessionDate(trainingId);
  
        if (!latestDate) continue;
  
        const now = new Date();
        const oneHourAfter = new Date(latestDate.getTime() + 60 * 60 * 1000);
        if (now >= oneHourAfter) {
          const result = await Notification.deleteMany({
            message: trainingId.toString(), 
            type: 'Trainee_Confirmed_Attendance',
          });
        }
      }
    } catch (err) {
      console.error('Error in scheduled notification cleanup:', err);
    }
  });
  
  

module.exports = {deleteNotif,notify, getNoReadNotif, getNotifWithType ,markReadNotif, notifyManagers, notifyUsers, deleteNotifFromUser, deleteNotifFromManagers, getAllNotif,deleteNotifById, deleteNotification,notifyRoleChange,notifyRoleChangeToManagers}