const User = require("../models/user.model");
const Training = require("../models/training.model");
const Session = require("../models/session.model");
const HotFeedback = require("../models/hotfeedback.model");
const ColdFeedback = require("../models/coldfeedback.model");
const Notification = require("../models/notification.model");
const Form = require("../models/form.model");
const jwt = require("jsonwebtoken");
const { notifyUsers, deleteNotif,notify } = require("../controllers/notification.controllers");

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
  const { email, password} = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "sign_in_error" });

  const passwordMatch = (password === user.password); 
  if (!passwordMatch) return res.status(401).json({ message: "sign_in_error" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.PRIVATE_KEY,
    { expiresIn: '365d' }
  );

  const userResponse = {
    _id: user._id,
    name:user.name,
    email:user.email,
    password:user.password,
    role:user.role,
    activity:user.activity,
    jobtitle:user.jobtitle,
    gender:user.gender,
    chef:user.chef,
    type:user.type,
  };

  res.json({ user: userResponse, token, id:user._id});
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
    const { name, email, password, role, activity, jobtitle, grade, gender,chef,type } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, password, role, activity, jobtitle, grade, gender,chef,type });

    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      if (err.errors.password) {
        return res.status(400).json({ error: 'wrong_password_format' });
      }
      if (err.errors.email) {
        return res.status(400).json({ error: 'invalid_email_format' });
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

const updatePasswordByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { password } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email }, 
      { password }, 
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    if (err.name === 'ValidationError' && err.errors.password) {
      return res.status(400).json({ error: 'wrong_password_format' });
    }

    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id: _id } = req.params;

    const deletedUser = await User.findByIdAndDelete(_id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    const trainings = await Training.find({ trainer: _id });
    const trainingIds = trainings.map(training => training._id);

    await Session.deleteMany({ training: { $in: trainingIds } });

    await Training.deleteMany({ trainer: _id });

    await Training.updateMany(
      {},
      {
        $pull: {
          traineesrequests: { trainee: _id },
          requestshistory: { trainee: _id },
          acceptedtrainees: _id,
          confirmedtrainees: _id,
          rejectedtrainees: _id,
        },
      }
    );

    await Session.updateMany(
      {},
      {
        $pull: {
          presenttrainees: _id
        }
      }
    );
    await HotFeedback.deleteMany({ trainee: _id });
    await ColdFeedback.deleteMany({ trainee: _id });

    await Notification.deleteMany({
      $or: [
        { recipient: _id },
        { sender: _id }
      ]
    });

    await Form.deleteMany({ trainer: _id });

    res.json({ message: "User deleted successfully", deletedUser });

  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: err.message });
  }
};


const callForTrainers = async (req, res) => { 
  try {
      const { sen, tp, msg } = req.body;

      notifyUsers(sen, tp, msg);
      res.status(201).json({ success: true, message: "Notifications sent to all trainers!" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error sending notifications" });
  }
}

const callForSpecifiedTrainers = async (req, res) => { 
  try {
    const { trainersIDs, sen, tp, msg } = req.body;

    if (!trainersIDs || !Array.isArray(trainersIDs) || trainersIDs.length === 0) {
      return res.status(400).json({ success: false, message: "No trainer emails provided." });
    }
    for (const rec of trainersIDs) {
      console.log(rec);
      await notify(rec,sen, tp, msg); 
    }
    res.status(201).json({ success: true, message: "Notifications sent to specified trainers!" });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ success: false, message: "Error sending notifications." });
  }
};


const uploadQuiz = async (req, res) => {
  try {
    const { userId, trainingId } = req.body;
    const file = req.file;

    if (!file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    let trainingRecord = user.trainingsAttended.find(
      t => t.training.toString() === trainingId
    );

    if (!trainingRecord) {
      trainingRecord = {
        training: trainingId,
        quizPreTraining: {},
        quizPostTraining: {},
      };
    }

    const type = training.quiz?.type;


    const quizData = {
      data: file.buffer,
      contentType: file.mimetype,
      fileName: file.originalname,
    };

    if (type === "pre") {
      trainingRecord.quizPreTraining = quizData;
    } else if (type === "post") {
      trainingRecord.quizPostTraining = quizData;
    } else {
      return res.status(400).json({ message: "Invalid quiz type" });
    }
    
    user.trainingsAttended.push(trainingRecord);
    notify(training.trainer, userId, "Quiz_Uploaded_From_Trainee", trainingId.toString());
    await user.save();
    res.status(200).json({ message: "quiz uploaded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getQuizFile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { trainingId, type } = req.body;
    if (!trainingId || !type) {
      return res.status(400).json({ message: "Missing trainingId or type" });
    }

    const tr = await Training.findById(trainingId);
    if (!tr) {
      return res.status(404).json({ message: "Training not found" });
    }

    const training = user.trainingsAttended.find(
      t => t.training.toString() === trainingId
    );
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    let quizFile = null;
    if (type === "pre") {
      quizFile = training.quizPreTraining;
    } else if (type === "post") {
      quizFile = training.quizPostTraining;
    } else {
      return res.status(400).json({ message: "Invalid quiz type" });
    }

    if (!quizFile || !quizFile.data) {
      return res.status(404).json({ message: `No ${type}-quiz file found` });
    }

    res.setHeader('Content-Type', quizFile.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(quizFile.fileName)}"`);

    deleteNotif(tr.trainer,req.params.id, "Quiz_Uploaded_From_Trainee", null);
    res.send(quizFile.data);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateScore = async (req, res) => {
  try {
    const { traineeId, trainingId, scorePre, scorePost } = req.body;
    console.log(scorePre, scorePost);

    const user = await User.findById(traineeId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const trainingIndex = user.trainingsAttended.findIndex(
      t => t.training.toString() === trainingId
    );

    if (trainingIndex === -1) {
      user.trainingsAttended.push({
        training: trainingId,
        quizPreTraining: {},
        quizPostTraining: {},
        scorePreTraining: scorePre ?? 0,
        scorePostTraining: scorePost ?? 0,
      });
    } else {
      if (scorePre) {
        user.trainingsAttended[trainingIndex].scorePreTraining = scorePre;
        console.log(user.trainingsAttended[trainingIndex]);
      }
      if (scorePost) {
        user.trainingsAttended[trainingIndex].scorePostTraining = scorePost;
      }
    }

    await user.save();
    res.status(200).json({ message: "Scores updated successfully" });
  } catch (err) {
    console.error("Error updating scores:", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { getUsers,signUser,verifyEmail,createUser,updateUser,deleteUser, getUserById,callForTrainers,uploadQuiz,getQuizFile,updateScore, callForSpecifiedTrainers,updatePasswordByEmail};
