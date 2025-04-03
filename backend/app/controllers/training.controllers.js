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

const { notifyManagers } = require("../controllers/notification.controllers");

const addTrainee = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training not found" });

    if (!training.traineesrequests) training.traineesrequests = [];
    if (!training.acceptedtrainees) training.acceptedtrainees = [];

    const reqBody = req.body; 

    if (!reqBody.trainee) {
      return res.status(400).json({ message: "Trainee ID is required" });
    }
    if (
      !training.traineesrequests.some(t => t.trainee.toString() === reqBody.trainee.toString()) &&
      !training.acceptedtrainees.includes(reqBody.trainee)
    ) {
      training.traineesrequests.push(reqBody);
      training.nbOfReceivedRequests = (training.nbOfReceivedRequests || 0) + 1;

      await training.save();

      notifyManagers(req, `New trainee request for training: ${training._id}`);
      res.json({ message: "Trainee added successfully", training });
    } else {
      return res.status(400).json({ message: "Trainee already added" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const acceptTrainee = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    const { trainee } = req.body;

    if (!training.traineesrequests.some(t => t.trainee.toString() === trainee.toString())) {
      return res.status(400).json({ message: "Trainee not found in training" });
    }

    if (training.acceptedtrainees.includes(trainee)) {
      return res.status(400).json({ message: "Trainee already accepted" });
    }
    training.acceptedtrainees.push(trainee);
    training.nbOfAcceptedRequests = training.acceptedtrainees.length;
    training.traineesrequests = training.traineesrequests.filter(t => t.trainee.toString() !== trainee);

    await training.save();
    res.json({ message: "Trainee accepted successfully", training });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTrainee = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    const { trainee } = req.body;
    if (!trainee) {
      return res.status(400).json({ message: "Trainee ID is required" });
    }
    training.acceptedtrainees = training.acceptedtrainees.filter(
      t => t?.toString() !== trainee.toString()
    );
    training.nbOfAcceptedRequests = training.acceptedtrainees.length;
    await training.save();
    res.json({ message: "Trainee deleted successfully", training });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rejectTrainee = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    const { trainee } = req.body;
    if (!training.traineesrequests.some(t => t.trainee.toString() === trainee.toString())) {
      return res.status(400).json({ message: "Trainee not found in training requests" });
    }

    training.traineesrequests = training.traineesrequests.filter(t => t.trainee.toString() !== trainee.toString());

    await training.save();

    res.json({ message: "Trainee rejected", training });
  } catch (err) {
    console.error("Error rejecting trainee:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};






module.exports = {getTrainings, getTrainingById, createTraining, updateTrainingById , deleteTrainingById, addTrainee, acceptTrainee,rejectTrainee,deleteTrainee}