const mongoose = require("mongoose");
const validator = require('validator');

const adminSchema = new mongoose.Schema({
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
}, { timestamps: true, collection: 'admin' });

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
