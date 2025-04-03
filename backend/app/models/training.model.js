const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  month: { type: String, required: true },
  quarter: { type: String},
  skillType: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  nbOfHours: { type: Number, required: true },
  nbOfReceivedRequests: { type: Number , default: 0 },
  nbOfAcceptedRequests: { type: Number },
  nbOfParticipants: { type: Number, required: true },
  nbOfAttendees: { type: Number},
  nbOfAttendeesCompleted: { type: Number},
  hotEvalRate: { type: Number},
  coldEvalRate: { type: Number},
  trainingFillRate: { type: Number},
  completionRate: {type: Number},
  costPerTrainer: {type: Number},
  costPerTrainee: {type: Number},
  nbOfSessions: { type: Number , required: true},
  delivered: {type: Boolean},
  mode: {type: String, required: true},
  comment: {type: String},
  type: {type: String, required: true},
  description: {type: String, required: true},
  trainer: { type: mongoose.Schema.Types.ObjectId,ref: "users" },
  traineesrequests: [{
    trainee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date }
}],
  acceptedtrainees: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
}, { collection: 'trainings', timestamps: true });

const Training = mongoose.model("Training", trainingSchema);

module.exports = Training;
