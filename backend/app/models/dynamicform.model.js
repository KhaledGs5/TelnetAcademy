const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema({
  id: String,
  label: String,
  type: { type: String, enum: ['text', 'rating', 'checkbox', 'radio'] },
  required: Boolean,
  options: [{
    label: String,
    value: String
  }]
});

const dynamicFormSchema = new mongoose.Schema({
  type: {type: String}, 
  fields: [formFieldSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

dynamicFormSchema.index({ 'type': 1 }, { unique: true });

module.exports = mongoose.model('DynamicForm', dynamicFormSchema);