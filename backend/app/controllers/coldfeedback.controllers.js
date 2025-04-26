const ColdFeedback = require("../models/coldfeedback.model");
const User = require("../models/user.model");
const DynamicForm = require("../models/dynamicform.model");
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

const calculateSentimentScore = async (feedbackData, formFields) => {
    const fieldsArray = formFields.fields || [];
    
    const textResponses = feedbackData.responses
      .filter(response => {
        return typeof response.value === 'string' || 
               (typeof response.value === 'object' && response.value !== null) ||
               (typeof response.value === 'number' && !isNaN(response.value));
      })
      .map(response => {
        const fieldConfig = fieldsArray.find(f => f.id === response.fieldId);
        if (!fieldConfig) return '';

        switch (fieldConfig.type) {
          case 'text':
            return response.value || '';
          
          case 'rating':
            const rating = Number(response.value);
            if (isNaN(rating)) return '';
            return `Rated ${rating} out of 5`;
          
          case 'checkbox':
            return Object.entries(response.value)
              .filter(([_, isChecked]) => isChecked)
              .map(([value]) => {
                const option = fieldConfig.options?.find(opt => opt.value === value);
                return option ? option.label : '';
              })
              .filter(Boolean)
              .join('. ');
          
          case 'radio':
            const option = fieldConfig.options?.find(opt => opt.value === response.value);
            return option ? option.label : '';
          
          default:
            return '';
        }
      })
      .filter(Boolean);
  
    const combinedText = textResponses.join('. ');
  
    let translated = combinedText;
    if (combinedText) {
      try {
        const translation = await translate(combinedText, { to: 'en' });
        translated = translation.text;
      } catch (err) {
        console.warn("Translation failed, using original text.");
      }
    }
  
    const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(translated || "");
    const compound = sentiment.compound;
  
    let sentimentScore;
    
    const ratings = feedbackData.responses
      .filter(response => {
        const fieldConfig = fieldsArray.find(f => f.id === response.fieldId);
        return fieldConfig?.type === 'rating' && typeof response.value === 'number';
      })
      .map(response => Number(response.value));
    
    const avgRating = ratings.length > 0 ? 
      ratings.reduce((sum, val) => sum + val, 0) / ratings.length : null;
  
    if (avgRating !== null) {
      const ratingContribution = avgRating; 
      const sentimentContribution = (compound + 1) * 2.5;
      sentimentScore = Math.round((ratingContribution + sentimentContribution) / 2);
    } else {
      sentimentScore = compound <= -0.6 ? 1 :
                      compound <= -0.2 ? 2 :
                      compound <=  0.2 ? 3 :
                      compound <=  0.6 ? 4 : 5;
    }
  
    return sentimentScore;
};

const addColdFeedback = async (req, res) => {
    try {
        const feedbackData = req.body;

        const formFields = await DynamicForm.findOne({ 
            type: "cold_feedback" 
          }).select('fields').lean();

        const sentimentScore = await calculateSentimentScore(feedbackData, formFields);
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