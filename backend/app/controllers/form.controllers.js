const Form = require("../models/form.model");
const { notifyManagers,deleteNotifById, deleteNotifFromUser ,notify } = require("../controllers/notification.controllers");

const getFormByTrainerId = async (req, res) => {
    try {
        const form = await Form.find({ trainer: req.params.id  });
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
        const { trainer, notifId } = req.body;

        notifyManagers(trainer,"New_Training_Request","None");
        deleteNotifById(notifId); 

        res.status(201).json(form);
    } catch (err) {
        console.log(err);
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

const deleteForm = async (req, res) => {
    try {
        const form = await Form.findByIdAndDelete(req.params.id);
        if (!form) return res.status(404).json({ message: "form_not_found" });
        deleteNotifFromUser(form.trainer, "New_Training_Request");
        res.json({ message: "form_deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateFormStatus = async (req, res) => {
    try {
        const form = await Form.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!form) return res.status(404).json({ message: "form_not_found" });
        notify(form.trainer, null, "New_Training_Status", "None");
        deleteNotifFromUser(form.trainer, "New_Training_Request");
        res.json(form);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {getFormByTrainerId, createForm, getForms, deleteForm, updateFormStatus}