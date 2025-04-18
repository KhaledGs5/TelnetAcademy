const express = require("express");
const { addHotFeedback,getHotFeedback} = require("../controllers/hotfeedback.controllers");

const router = express.Router();

router.get("/hotfeedback/:id", getHotFeedback);
router.post("/hotfeedback", addHotFeedback);


module.exports = router;