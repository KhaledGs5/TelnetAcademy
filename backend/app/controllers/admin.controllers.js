const Admin = require("../models/admin.model");


const signAdmin = async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "email_not_found" });
    const passwordMatch = (password == admin.password);
    if (!passwordMatch) return res.status(401).json({ message: "incorrect_password" });
    res.json( admin );
  };


  const updateAdmin = async (req, res) => {
    try {
      const { id: _id } = req.params;
      const { name, password } = req.body;
      const updatedAdmin = await Admin.findByIdAndUpdate(_id, { name, password }, { new: true  ,  runValidators: true });

      if (!updatedAdmin) return res.status(404).json({ message: "Admin not found" });
      res.json( updatedAdmin );
    } catch (err) {
      if (err.name === 'ValidationError') {
        if (err.errors.password) {
          return res.status(400).json({
            error:
              'wrong_password_format',
          });
        }
        if (err.errors.email) {
          return res.status(400).json({
            error: 'invalid_email_format',
          });
        }
      }
  
      if (err.code === 11000) {
        return res.status(400).json({ error: 'email_already_exists' });
      }
      res.status(500).json({ message: err.message });
    }
};

module.exports = {signAdmin, updateAdmin};