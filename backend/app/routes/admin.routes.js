const express = require("express");
const { signAdmin, updateAdmin } = require("../controllers/admin.controllers");

const router = express.Router();

router.post("/admin/sign-in", signAdmin);
router.put("/admin/:id", updateAdmin);

module.exports = router;