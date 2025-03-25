const express = require("express");
const { getFormByTrainerId,createForm, getForms , deleteForm, updateFormStatus} = require("../controllers/form.controllers");

const router = express.Router();

router.get("/form/:id", getFormByTrainerId);
router.post("/form", createForm);
router.get("/form", getForms);
router.delete("/form/:id", deleteForm);
router.put("/form/status/:id", updateFormStatus); 

module.exports = router;