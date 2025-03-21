const express = require("express");
const { getUsers, signUser, verifyEmail,createUser, updateUser, deleteUser , getUserById, updateMarkedTrainings, getNotif, markRead, 
    deleteNotif, getAvailableNotif} = require("../controllers/user.controllers");

const router = express.Router();

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users/sign-in", signUser);
router.post("/users/verify-email", verifyEmail);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.put("/users/marked_trainings/:id", updateMarkedTrainings);
router.delete("/users/:id", deleteUser);
router.get("/users/callnotif/:id", getNotif);
router.get("/users/availablenotif/:id", getAvailableNotif);
router.put("/users/callnotif/:id", markRead);
router.delete("/users/callnotif/:id", deleteNotif);

module.exports = router;
