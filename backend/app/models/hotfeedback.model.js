const mongoose = require("mongoose");

const fieldValueSchema = new mongoose.Schema({
  fieldId: String,
  value: mongoose.Schema.Types.Mixed 
})

const hotfeedbackSchema = new mongoose.Schema({
    theme: {type: String,required: true},
    association: {type: String,required: true},
    trainer: {type: String,required: true},
    trainingDate: {type: String,required: true},
    location: {type: String,required: true},
    trainee: { type: mongoose.Schema.Types.ObjectId,ref: "User" },
    training: { type: mongoose.Schema.Types.ObjectId,ref: "Training" },
    sentimentScore: { type: Number, required: false },
    responses: [fieldValueSchema],
}, { collection: "hotfeedback" ,timestamps: true });

const HotFeedback = mongoose.model("HotFeedback", hotfeedbackSchema);
module.exports = HotFeedback;
