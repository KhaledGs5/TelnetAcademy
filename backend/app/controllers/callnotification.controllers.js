const Notification = require("../models/callnotification.model");
const User = require("../models/user.model");


const callForTrainers = async (req, res) => { 
    try {
        const { message } = req.body;

        const trainers = await User.find({ role: { $in: ["trainer", "trainee_trainer"] } });

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


module.exports = {callForTrainers}