const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

}, { collection: 'form', timestamps: true });

const Form = mongoose.model("Form", userSchema);
module.exports = User;
