const Training = require("../models/training.model");
const Session = require("../models/session.model");

const getTrainings = async (req, res) => {
    try {
      const trainings = await Training.find();
      res.status(200).json(trainings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

const getTrainingById = async (req, res) => {
    try {
      const training = await Training.findById(req.params.id);
      if (!training) return res.status(404).json({ message: "Training not found" });
      res.json(training);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

const createTraining = async (req, res) => {
    try {
      const training = new Training(req.body);
      await training.save();
      res.status(201).json(training);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

const updateTrainingById = async (req, res) => {
    try {
      const training = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!training) return res.status(404).json({ message: "Training not found" });
        res.json(training);
        } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const deleteTrainingById = async (req, res) => {
    try {
      const training = await Training.findByIdAndDelete(req.params.id);
      await Session.deleteMany({ training: training._id });
      if (!training) return res.status(404).json({ message: "Training not found" });
      res.json({ message: "Training deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};



module.exports = {getTrainings, getTrainingById, createTraining, updateTrainingById , deleteTrainingById}