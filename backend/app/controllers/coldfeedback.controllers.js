const ColdFeedback = require("../models/coldfeedback.model");
const User = require("../models/user.model");
const { notifyManagers, deleteNotifFromManagers } = require("../controllers/notification.controllers");

const getColdFeedback = async (req, res) => {
    try {
        const coldfeedback = await ColdFeedback.find({ trainee: req.params.id  });
        if (!coldfeedback) return res.status(404).json({ message: "coldfeedback_not_found" });
        res.json(coldfeedback);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const addColdFeedback = async (req, res) => {
    try {
        const coldfeedback = new ColdFeedback(req.body);
        await coldfeedback.save();

        const { trainee, training } = req.body;
        const user = await User.findById(trainee);
        user.trainingsCanSendColdFeedback = user.trainingsCanSendColdFeedback.filter(t => t.toString() !== training.toString());

        notifyManagers(trainee, 'New_Feedback', 'None', req);
        deleteNotifFromManagers(trainee, "Request_Cold_Feedback");

        await user.save();
        res.status(201).json(coldfeedback);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
};

module.exports = {getColdFeedback,addColdFeedback}