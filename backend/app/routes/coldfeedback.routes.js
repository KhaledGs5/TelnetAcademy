const express = require("express");
const { addColdFeedback,getColdFeedback} = require("../controllers/coldfeedback.controllers");

const router = express.Router();

router.get("/coldfeedback/:id", getColdFeedback);
router.post("/coldfeedback", addColdFeedback);


module.exports = router;