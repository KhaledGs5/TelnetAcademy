const express = require("express");
const { callForTrainers } = require("../controllers/notification.controllers");

const router = express.Router();


router.post("/callnotification", callForTrainers);

module.exports = router;