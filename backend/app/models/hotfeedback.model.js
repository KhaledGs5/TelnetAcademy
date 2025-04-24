const mongoose = require("mongoose");

const hotfeedbackSchema = new mongoose.Schema({
    theme: {type: String,required: true},
    association: {type: String,required: true},
    trainer: {type: String,required: true},
    trainingDate: {type: String,required: true},
    location: {type: String,required: true},
    objectivesCommunication: { type: Number }, 
    trainingOrganization: { type: Number }, 
    groupComposition: { type: Number }, 
    materialAdequacy: { type: Number }, 
    programCompliance: { type: Number }, 
    contentClarity: { type: Number },
    materialQuality: { type: Number }, 
    trainingAnimation: { type: Number },
    trainingProgress: { type: Number }, 
    metExpectations: { type: Number }, 
    objectivesAchieved: { type: Number }, 
    exercisesRelevance: { type: Number }, 
    willApplySkills: { type: Number },
    comments: { type: String }, 
    trainee: { type: mongoose.Schema.Types.ObjectId,ref: "User" },
    training: { type: mongoose.Schema.Types.ObjectId,ref: "Training" },
    sentimentScore: { type: Number, required: false },
}, { collection: "hotfeedback" ,timestamps: true });

const HotFeedback = mongoose.model("HotFeedback", hotfeedbackSchema);
module.exports = HotFeedback;
