const express = require("express");
const { getSessions , getSessionById , getSessionByTrainingId , createSession, updateSessionById, deleteSessionById
    ,markTraineeAsPresent, markTraineeAsAbsent} = require("../controllers/session.controllers");

const router = express.Router();

router.get("/sessions", getSessions);
router.get("/sessions/:id", getSessionById);
router.get("/sessions/training/:trainingId", getSessionByTrainingId);
router.post("/sessions", createSession);
router.put("/sessions/:id", updateSessionById);
router.delete("/sessions/:id", deleteSessionById);
router.put("/sessions/trainee/:id", markTraineeAsPresent);
router.put("/sessions/trainee/absent/:id", markTraineeAsAbsent);

module.exports = router;
