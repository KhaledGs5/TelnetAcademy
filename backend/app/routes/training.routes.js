const express = require("express");
const { getTrainings , getTrainingById , createTraining, updateTrainingById, deleteTrainingById} = require("../controllers/training.controllers");

const router = express.Router();

router.get("/trainings", getTrainings);
router.get("/trainings/:id", getTrainingById);
router.post("/trainings", createTraining);
router.put("/trainings/:id", updateTrainingById);
router.delete("/trainings/:id", deleteTrainingById);

module.exports = router;
