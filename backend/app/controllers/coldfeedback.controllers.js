const ColdFeedback = require("../models/coldfeedback.model");
const User = require("../models/user.model");
const vader = require('vader-sentiment');
const translate = require('@vitalets/google-translate-api');
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
        const feedbackData = req.body;

        const textFields = [
            feedbackData.comments,
            feedbackData.improvment,
            feedbackData.trainingImprovementsSuggested,
            feedbackData.whyNotApplied
        ].filter(Boolean).join(". ");

        let translated = textFields;
        if (textFields) {
            try {
                const translation = await translate(textFields, { to: 'en' });
                translated = translation.text;
            } catch (err) {
                console.warn("Translation failed, using original text.");
            }
        }
        const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(translated || "");
        const compound = sentiment.compound;

        const sentimentScore = compound <= -0.6 ? 1 :
                               compound <= -0.2 ? 2 :
                               compound <=  0.2 ? 3 :
                               compound <=  0.6 ? 4 : 5;
    
        feedbackData.sentimentScore = sentimentScore;

        const coldfeedback = new ColdFeedback(feedbackData);
        await coldfeedback.save();

        const { trainee, training } = feedbackData;
        const user = await User.findById(trainee);
        user.trainingsCanSendColdFeedback = user.trainingsCanSendColdFeedback.filter(t => t.toString() !== training.toString());

        notifyManagers(trainee, 'New_Feedback', training.toString());
        deleteNotifFromManagers(trainee, "Request_Cold_Feedback");

        await user.save();
        res.status(201).json(coldfeedback);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
};

module.exports = {getColdFeedback,addColdFeedback}