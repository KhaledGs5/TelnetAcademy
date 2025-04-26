const mongoose = require("mongoose");

const fieldValueSchema = new mongoose.Schema({
  fieldId: String,
  value: mongoose.Schema.Types.Mixed 
})

const coldfeedbackSchema = new mongoose.Schema({
    theme: {type: String,required: true},
    association: {type: String,required: true},
    trainer: {type: String,required: true},
    trainingDate: {type: String,required: true},
    location: {type: String,required: true},
    name: {type: String , required: true},
    matricule: {type: String, required: true},
    function: {type: String, required: true},
    service: {type: String, required: true}, 
    // appliedKnowledge: { type: Boolean, required: true },
    // knowledge: { type: String, required: false },
    // whyNotApplied : { type: String, required: false, enum: [
    //     "Lack of time",
    //     "Modules not acquired",
    //     "Training not suitable",
    //     "Lack of resources",
    //     "Other"
    //   ],
    // },
    // otherWhyNotApplied: { type: String, required: false },
    // improvedWorkEfficiency: { type: Boolean, required: true },
    // improvment: { type: String, required: false },
    // whyNotImproved: { type: String, required: false },
    // trainingImprovementsSuggested: { type: String },
    // comments: { type: String },
    trainee: { type: mongoose.Schema.Types.ObjectId,ref: "User" },
    training: { type: mongoose.Schema.Types.ObjectId,ref: "Training" },
    sentimentScore: { type: Number, required: false },
    responses: [fieldValueSchema],
}, { collection: "coldfeedback" ,timestamps: true });

const ColdFeedback = mongoose.model("ColdFeedback", coldfeedbackSchema);
module.exports = ColdFeedback;
