const DynamicForm = require("../models/dynamicform.model");

const upsertFormByType = async (req, res) => {
  try {
    const { type, fields } = req.body;

    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: 'Fields must be provided as an array' });
    }
    let form = await DynamicForm.findOne({ type });

    if (form) {
      form.fields = fields;
      form.updatedAt = new Date();
    } else {
      form = new DynamicForm({
        type,
        fields,
      });
    }
    await form.save();

    res.status(200).json({
      message: `Form ${form ? 'updated' : 'created'} successfully`,
      form
    });

  } catch (error) {
    console.error('Error saving form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllForms = async (req, res) => {
  try {
    const forms = await DynamicForm.find({});
    
    if (!forms || forms.length === 0) {
      return res.status(404).json({ message: 'No forms found' });
    }

    res.status(200).json({
      count: forms.length,
      forms
    });

  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {upsertFormByType,getAllForms}