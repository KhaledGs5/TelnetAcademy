const express = require("express");
const { getSessions , getSessionById , getSessionByTrainingId , createSession, updateSessionById, deleteSessionById} = require("../controllers/session.controllers");

const router = express.Router();

router.get("/sessions", getSessions);
router.get("/sessions/:id", getSessionById);
router.get("/sessions/training/:trainingId", getSessionByTrainingId);
router.post("/sessions", createSession);
router.put("/sessions/:id", updateSessionById);
router.delete("/sessions/:id", deleteSessionById);

module.exports = router;
