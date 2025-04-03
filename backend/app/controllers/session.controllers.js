const Session = require("../models/session.model");
const Training = require("../models/training.model");

const getSessions = async (req, res) => {
    try {
      const sessions = await Session.find();
      res.status(200).json(sessions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

const getSessionById = async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) return res.status(404).json({ message: "Session not found" });
      res.json(session);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  const getSessionByTrainingId = async (req, res) => {
    try {
        const sessions = await Session.find({ training: req.params.trainingId });
        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ message: "Sessions not found" });
        }
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createSession = async (req, res) => {
  try {
    const { date, training } = req.body;
    const existingSession = await Session.findOne({ date, training });

    if (existingSession) {
      return res.status(400).json({ message: "same_session_date" });
    }

    // Create and save the session
    const session = new Session(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



const updateSessionById = async (req, res) => {
    try {
        const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!session) return res.status(404).json({ message: "Session not found" });
          res.json(session);
          } catch (err) {
          res.status(500).json({ message: err.message });
      }
};

const deleteSessionById = async (req, res) => {
  try {
    const { id: _id } = req.params;
    const session = await Session.findById(_id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const trainingId = session.training; 

    await Session.findByIdAndDelete(_id);

    if (trainingId) {
      await Training.findByIdAndUpdate(trainingId, { $inc: { nbOfSessions: -1 } });
    }

    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {getSessions, getSessionById, createSession, getSessionByTrainingId, updateSessionById, deleteSessionById}