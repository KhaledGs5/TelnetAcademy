const express = require('express');
const router = express.Router();
const { upsertFormByType, getAllForms } = require('../controllers/dynamicfrom.controllers');

router.post('/dynamicform/changeforms', upsertFormByType);
router.get('/dynamicform/forms', getAllForms);

module.exports = router;