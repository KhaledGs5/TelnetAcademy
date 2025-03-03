const User = require("./user.model");

const traineeSchema = new mongoose.Schema({
    traineeId: { type: Number, unique: true, required: true },
  }, { timestamps: true });
  
  const Trainee = User.discriminator("Trainee", traineeSchema);
  module.exports = Trainee;
  