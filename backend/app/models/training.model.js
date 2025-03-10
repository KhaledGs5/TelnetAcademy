const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  title: { type: String, required: true },
  month: { type: String, required: true },
  quarter: { type: String, required: true },
  skillType: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  nbOfHours: { type: Number, required: true },
  nbOfReceivedRequests: { type: Number, required: true },
  nbOfParticipants: { type: Number, required: true },
  nbOfAttendees: { type: Number, required: true },
  nbOfAttendeesCompleted: { type: Number, required: true },
  hotEvalRate: { type: Number, required: true },
  coldEvalRate: { type: Number, required: true },
  trainingFillRate: { type: Number, required: true},
  completionRate: {type: Number, required: true},
  costPerTrainer: {type: Number, required: true},
  costPerTrainee: {type: Number, required: true},
  delivered: {type: Boolean, required: true},
  mode: {type: String, required: true},
  comment: {type: String, required: true},
  type: {type: String, required: true},
  trainerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" }
}, { collection: 'training', timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
