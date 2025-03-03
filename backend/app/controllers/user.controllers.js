const User = require("../models/user.model");


const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
    try {
      const { id: _id } = req.params;
      const { name, email, password, role } = req.body;
      const updatedUser = await User.findByIdAndUpdate(_id, { name, email, password, role }, { new: true });

      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User updated successfully", updatedUser });
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



module.exports = { getUsers,createUser,updateUser,deleteUser};
