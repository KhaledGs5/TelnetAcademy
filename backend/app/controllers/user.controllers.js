const User = require("../models/user.model");


const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  const { id: _id } = req.params;
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const signUser = async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "email_not_found" });
  const passwordMatch = (password == user.password);
  const roleMatch = (role == user.role || (user.role == "trainee_trainer" && role != "manager"));
  if (!passwordMatch) return res.status(401).json({ message: "incorrect_password" });
  if (!roleMatch) return res.status(401).json({ message: "role_not_allowed" });
  res.json( user );
};

const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }
    res.json({ success: true, message: "Email exists" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


const createUser = async (req, res) => {
  try {
    const { name, email, password, role, activity, jobtitle, grade, gender } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, password, role ,activity, jobtitle, grade, gender });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
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

const updateUser = async (req, res) => {
    try {
      const { id: _id } = req.params;
      const { name, email, password, role } = req.body;
      const updatedUser = await User.findByIdAndUpdate(_id, { name, email, password, role }, { new: true ,  runValidators: true});

      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.json( updatedUser );
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

const updateMarkedTrainings = async (req, res) => {
  try {
      const { id: _id } = req.params;
      const { listOfMarkedTrainings } = req.body; 

      const updatedUser = await User.findByIdAndUpdate(
          _id,
          { listOfMarkedTrainings },
          { new: true }
      );

      if (!updatedUser) return res.status(404).json({ message: "User not found" });

      res.json(updatedUser);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


const deleteUser = async (req, res) => {
    try {
      const { id: _id } = req.params;
      const deletedUser = await User.findByIdAndDelete(_id);

      if (!deletedUser) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User deleted successfully", deletedUser });
    } catch (err) {
    res.status(500).json({ message: err.message });
    }
}



module.exports = { getUsers,signUser,verifyEmail,createUser,updateUser,deleteUser, getUserById, updateMarkedTrainings};
