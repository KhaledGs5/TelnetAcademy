const express = require("express");
const { getFormByTrainerId,createForm, getForms } = require("../controllers/form.controllers");

const router = express.Router();

router.get("/form/:trainerId", getFormByTrainerId);
router.post("/form", createForm);
router.get("/form", getForms);

module.exports = router;