const HotFeedback = require("../models/hotfeedback.model");
const User = require("../models/user.model");
const vader = require('vader-sentiment');
const translate = require('@vitalets/google-translate-api');
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
        const feedbackData = req.body;

        const ratingFields = [
            'objectivesCommunication',
            'trainingOrganization',
            'groupComposition',
            'materialAdequacy',
            'programCompliance',
            'contentClarity',
            'materialQuality',
            'trainingAnimation',
            'trainingProgress',
            'metExpectations',
            'objectivesAchieved',
            'exercisesRelevance',
            'willApplySkills'
        ];

        const numericRatings = ratingFields
            .map(field => feedbackData[field])
            .filter(val => typeof val === 'number');

        const avgNumericScore = numericRatings.length
            ? numericRatings.reduce((a, b) => a + b, 0) / numericRatings.length
            : 0;

        let comment = feedbackData.comments || '';
        let translated = comment;

        if (comment) {
            try {
                const translation = await translate(comment, { to: 'en' });
                translated = translation.text;
            } catch (err) {
                console.warn("Translation failed, using original comment.");
            }
        }

        const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(translated);
        const compound = sentiment.compound;
        const commentScore = compound <= -0.6 ? 1 :
                             compound <= -0.2 ? 2 :
                             compound <=  0.2 ? 3 :
                             compound <=  0.6 ? 4 : 5;

        const finalScore = Math.round(((avgNumericScore + commentScore) / 2) * 100) / 100;

        feedbackData.sentimentScore = finalScore;

        const hotfeedback = new HotFeedback(feedbackData);
        await hotfeedback.save();

        const { trainee, training } = req.body;
        const user = await User.findById(trainee);
        user.trainingsCanSendHotFeedback = user.trainingsCanSendHotFeedback.filter(t => t.toString() !== training.toString());

        notifyManagers(trainee, 'New_Feedback', training.toString());
        deleteNotifFromManagers(trainee, "Request_Hot_Feedback");

        await user.save();
        res.status(201).json(hotfeedback);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
};

module.exports = {getHotFeedback,addHotFeedback}