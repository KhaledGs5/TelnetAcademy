const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
    matricule: {type: String,required: true},
    name: {type: String,required: true},
    fonction: {type: String,required: true},
    activite: {type: String,required: true},
    dateEmbauche: {type: Date,required: true},
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
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
}, { collection: "form" ,timestamps: true });

const Form = mongoose.model("Form", formSchema);
module.exports = Form;
