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
  type: { type: String, required: function () { return this.role === "trainer"; }, default: "internal" }, 
  listOfMarkedTrainings: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Training",
    required: function () { return this.role === "trainer"; },
    default: [],
  }, 
}, { collection: 'users', timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
