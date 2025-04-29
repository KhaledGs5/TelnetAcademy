const express = require("express");
const { getUsers, signUser, verifyEmail,createUser, updateUser, deleteUser , getUserById, callForTrainers,uploadQuiz,getQuizFile,updateScore,callForSpecifiedTrainers,updatePasswordByEmail} = require("../controllers/user.controllers");

const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { verifyAdmin } = require("../security/auth.middleware");

router.put('/users/upload-quiz', upload.single('file'), uploadQuiz);
router.post('/users/get-quiz-file/:id', getQuizFile);
router.put('/users/update-score', updateScore);
router.put('/users/:email/password', updatePasswordByEmail);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users/sign-in", signUser);
router.post("/users/verify-email", verifyEmail);
router.post("/users", verifyAdmin, createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.post("/users/callfortrainers", callForTrainers);
router.post("/users/callforspecifiedtrainers", callForSpecifiedTrainers);


module.exports = router;
