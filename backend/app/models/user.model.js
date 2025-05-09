const mongoose = require("mongoose");
const validator = require('validator');


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true , validate: [validator.isEmail, 'Invalid email format']},
  password: { type: String, required: true,
    minlength: 8,
    validate: {
      validator: function (value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      },
      message:
        'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    },
  },
  role: { type: String, enum: ["trainer", "trainee", "trainee_trainer", "manager"], required: true },
  activity: { type: String, required: true },
  jobtitle: { type: String, required: true },
  gender: { type: String, required: true },
  grade: { type: String, required: true },
  chef: { type: String, required: true },
  type: {
    type: String,
    required: function () {
      return ["trainer", "trainee_trainer","trainee"].includes(this.role);
    },
    default: "internal"
  },
  trainingsCanSendColdFeedback: [{
    type: mongoose.Schema.Types.ObjectId,ref: "Training",
    required: function () {
      return ["trainee", "trainee_trainer"].includes(this.role);
    },
    default: [],
  }],
  trainingsCanSendHotFeedback: [{
    type: mongoose.Schema.Types.ObjectId,ref: "Training",
    required: function () {
      return ["trainee", "trainee_trainer"].includes(this.role);
    },
    default: [],
  }],
  trainingsAttended: [{
    training: { type: mongoose.Schema.Types.ObjectId, ref: 'Training' },
    quizPreTraining: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },
    quizPostTraining: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },
    scorePreTraining: { type: Number , default: 0 },
    scorePostTraining: { type: Number , default: 0 },
  }], 
  isTrained: { type : Boolean, required: false }, 
}, { collection: 'users', timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
