const express = require("express");
const { getTrainings , getTrainingById , createTraining, updateTrainingById, deleteTrainingById, addTrainee
    ,acceptTrainee,rejectTrainee,deleteTrainee
} = require("../controllers/training.controllers");

const router = express.Router();

router.get("/trainings", getTrainings);
router.get("/trainings/:id", getTrainingById);
router.post("/trainings", createTraining);
router.put("/trainings/:id", updateTrainingById);
router.delete("/trainings/:id", deleteTrainingById);
router.put("/trainings/register/:id", addTrainee);
router.put("/trainings/accept/:id", acceptTrainee);
router.put("/trainings/reject/:id", rejectTrainee);
router.put("/trainings/delete/:id", deleteTrainee);

module.exports = router;
