const mongoose = require("mongoose");
const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");

dayjs.extend(isBetween);



const sessionSchema = new mongoose.Schema({
  name: { type: String },
  date: { type: Date },
  duration: { type: Number },
  location: { type: String },
  status: { type: String, enum: ["scheduled", "in_progress", "completed"] },
  training: { type: mongoose.Schema.Types.ObjectId, required: true,ref: "Training" },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  presenttrainees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { collection: 'sessions', timestamps: true });

sessionSchema.index({ date: 1, training: 1 }, { unique: true });

sessionSchema.pre('save', function(next) {
  if (!this.date) {
    return next();
  }

  const currentTime = dayjs();
  const sessionDate = dayjs(this.date);
  const endDate = sessionDate.add(this.duration, 'hour');

  if (sessionDate.isAfter(currentTime)) {
    this.status = 'scheduled';
  } else if (currentTime.isBetween(sessionDate, endDate, null, '[)')) {
    this.status = 'in_progress';
  } else if (currentTime.isAfter(endDate)) {
    this.status = 'completed';
  }

  next();
});


sessionSchema.set('toJSON', {
    transform: (doc, ret) => {
      if (ret.date) {
        ret.date = dayjs(ret.date).format("YYYY-MM-DD hh:mm A");
      }
      return ret;
    }
  })

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;