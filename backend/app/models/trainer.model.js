const User = require("./user.model");

const trainerSchema = new mongoose.Schema({
  trainerId: { type: Number, unique: true, required: true },
}, { timestamps: true });

const Trainer = User.discriminator("Trainer", trainerSchema);
module.exports = Trainer;
