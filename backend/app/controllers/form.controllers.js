const Form = require("../models/form.model");

const getFormByTrainerId = async (req, res) => {
    try {
        const form = await Form.findOne({ trainer: req.params.trainerId  });
        if (!form) return res.status(404).json({ message: "form_not_found" });
        res.json(form);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const createForm = async (req, res) => {
    try {
        const form = new Form(req.body);
        await form.save();
        res.status(201).json(form);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getForms = async (req, res) => {
    try {
        const forms = await Form.find();
        res.json(forms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {getFormByTrainerId, createForm, getForms}