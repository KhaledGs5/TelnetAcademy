const express = require("express");
const { getTrainings , getTrainingById , createTraining, updateTrainingById, deleteTrainingById, addTraineeReq
    ,acceptTraineeReq,rejectTraineeReq,deleteTrainee,traineeConfirm,getFeedbacks,sendColdRequest, sendHotRequest,
    uploadQuiz, getQuizFile
} = require("../controllers/training.controllers");

const router = express.Router();
const multer = require('multer'); 
const upload = multer();

router.put('/trainings/upload-quiz', upload.single('file'), uploadQuiz);
router.post('/trainings/get-quiz-file/:id', getQuizFile);
router.get("/trainings", getTrainings);
router.get("/trainings/:id", getTrainingById);
router.post("/trainings", createTraining);
router.put("/trainings/:id", updateTrainingById);
router.delete("/trainings/:id", deleteTrainingById);
router.put("/trainings/register/:id", addTraineeReq);
router.put("/trainings/accept/:id", acceptTraineeReq);
router.put("/trainings/reject/:id", rejectTraineeReq);
router.put("/trainings/confirm/:id", traineeConfirm);
router.put("/trainings/delete/:id", deleteTrainee);
router.post("/trainings/feedbacks/:id", getFeedbacks);
router.post("/trainings/sendcoldrequest/:id", sendColdRequest);
router.post("/trainings/sendhotrequest/:id", sendHotRequest);

module.exports = router;
