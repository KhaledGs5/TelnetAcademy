const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
    matricule: {type: String,required: true},
    name: {type: String,required: true},
    position: {type: String,required: true},
    activity: {type: String,required: true},
    dateOfHire: {type: Date,required: true},
    domains: [
        {
            description: { type: String, required: false },
            expertise: { type: String, required: false }
        }
    ],
    hasExperience: {type: Boolean,default: false},
    exp: [
        {
            theme: { type: String, required: false },
            cadre: { type: String, required: false },
            periode: { type: String, required: false }
        }
    ],
    motivation: {type: String, required: false},
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending","approved", "rejected", "deleted"], default: "pending" },
}, { collection: "form" ,timestamps: true });

const Form = mongoose.model("Form", formSchema);
module.exports = Form;
