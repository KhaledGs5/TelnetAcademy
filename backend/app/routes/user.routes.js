const express = require("express");
const { getUsers, signUser, verifyEmail,createUser, updateUser, deleteUser , getUserById} = require("../controllers/user.controllers");

const router = express.Router();

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users/sign-in", signUser);
router.post("/users/verify-email", verifyEmail);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
