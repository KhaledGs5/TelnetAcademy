const HotFeedback = require("../models/hotfeedback.model");
const User = require("../models/user.model");
const { notifyManagers, deleteNotifFromManagers } = require("../controllers/notification.controllers");

const getHotFeedback = async (req, res) => {
    try {
        const hotfeedback = await HotFeedback.find({ trainee: req.params.id  });
        if (!hotfeedback) return res.status(404).json({ message: "hotfeedback_not_found" });
        res.json(hotfeedback);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const addHotFeedback = async (req, res) => {
    try {
        const hotfeedback = new HotFeedback(req.body);
        await hotfeedback.save();

        const { trainee, training } = req.body;
        const user = await User.findById(trainee);
        user.trainingsCanSendHotFeedback = user.trainingsCanSendHotFeedback.filter(t => t.toString() !== training.toString());

        notifyManagers(trainee, 'New_Feedback', 'None', req);
        deleteNotifFromManagers(trainee, "Request_Hot_Feedback");

        await user.save();
        res.status(201).json(hotfeedback);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
};

module.exports = {getHotFeedback,addHotFeedback}