const Training = require("../models/training.model");
const Session = require("../models/session.model");
const Notification = require("../models/notification.model")
const ColdFeedback = require("../models/coldfeedback.model");
const HotFeedback= require("../models/hotfeedback.model");
const User = require("../models/user.model");
const cron = require('node-cron');
const { notifyManagers, deleteNotifFromUser ,deleteNotifFromManagers,notify,deleteNotif} = require("../controllers/notification.controllers");

const getTrainings = async (req, res) => {
    try {
      const trainings = await Training.find();
      res.status(200).json(trainings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

const getTrainingById = async (req, res) => {
    try {
      const training = await Training.findById(req.params.id);
      if (!training) return res.status(404).json({ message: "Training not found" });
      res.json(training);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

const createTraining = async (req, res) => {
  try {
    const { date, month, nbOfHours } = req.body;

    const existingTraining = await Training.findOne();
    const trainingsCost = existingTraining?.trainingsCost || 50;

    const training = await Training.create(req.body);

    if (nbOfHours) {
      training.costPerTrainer = trainingsCost * nbOfHours;
    }
    const firstDate = await getFirstSessionDateFromBody(date, month);
    if (firstDate) {
      training.registrationDeadline = new Date(firstDate.getTime() - 24 * 60 * 60 * 1000);
      await training.save();
    }

    res.status(201).json(training);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTrainingById = async (req, res) => {
    try {
      const training = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!training) return res.status(404).json({ message: "Training not found" });
        res.json(training);
        } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const deleteTrainingById = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);

    if (!training) return res.status(404).json({ message: "Training not found" });

    await Session.deleteMany({ training: training._id });
    await ColdFeedback.deleteMany({ training: training._id });
    await HotFeedback.deleteMany({ training: training._id });
    await Notification.deleteMany({ message: training._id.toString() });

    res.json({ message: "Training and related data deleted successfully" });
  } catch (err) {
    console.error("Error deleting training:", err);
    res.status(500).json({ message: err.message });
  }
};

const updateAll = async (req, res) => {
  try {
    const { trainingsCost } = req.body;
    const trainings = await Training.find({});

    for (let training of trainings) {
      training.trainingsCost = trainingsCost;
      if (training.nbOfHours) {
        training.costPerTrainer = trainingsCost * training.nbOfHours;
      }
      await training.save();
    }

    res.json({ message: "All trainings updated successfully" });
  } catch (err) {
    console.error("Error updating all trainings:", err);
    res.status(500).json({ message: err.message });
  }
};


// Trainee

const addTraineeReq = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training not found" });

    if (!training.traineesrequests) training.traineesrequests = [];
    if (!training.acceptedtrainees) training.acceptedtrainees = [];

    const { trainee } = req.body; 

    if (!trainee) {
      return res.status(400).json({ message: "Trainee ID is required" });
    }
    if (
      !training.traineesrequests.some(t => t.trainee.toString() === trainee.toString()) &&
      !training.acceptedtrainees.includes(trainee)
    ) {
      training.traineesrequests.push(req.body);
      training.requestshistory.push(req.body);
      training.nbOfReceivedRequests = (training.nbOfReceivedRequests || 0) + 1;

      await training.save();

      notifyManagers(trainee, "New_Trainee_Request", req.params.id.toString());
      res.json({ message: "Trainee added successfully", training });
    } else {
      return res.status(400).json({ message: "Trainee already added" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const acceptTraineeReq = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    const { trainee, manageraccepted} = req.body;

    if (!training.traineesrequests.some(t => t.trainee.toString() === trainee.toString())) {
      return res.status(400).json({ message: "Trainee not found in training" });
    }

    if (training.acceptedtrainees.includes(trainee)) {
      return res.status(400).json({ message: "Trainee already accepted" });
    }
    training.acceptedtrainees.push(trainee);
    training.nbOfAcceptedRequests = training.acceptedtrainees.length;
    training.traineesrequests = training.traineesrequests.filter(t => t.trainee.toString() !== trainee);

    await training.save();
    notify(trainee, manageraccepted, "Request_Accepted", req.params.id.toString());
    deleteNotifFromUser(trainee, "New_Trainee_Request", req.params.id.toString());
    res.json({ message: "Trainee accepted successfully", training });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rejectTraineeReq = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    const { trainee, managerrejected } = req.body;
    if (!training.traineesrequests.some(t => t.trainee.toString() === trainee.toString())) {
      return res.status(400).json({ message: "Trainee not found in training requests" });
    }

    training.traineesrequests = training.traineesrequests.filter(t => t.trainee.toString() !== trainee.toString());
    if(!training.rejectedtrainees.includes(trainee))training.rejectedtrainees.push(trainee);

    await training.save();
    notify(trainee, managerrejected, "Request_Rejected", req.params.id.toString());
    deleteNotifFromUser(trainee, "New_Trainee_Request", req.params.id.toString());

    res.json({ message: "Trainee rejected", training });
  } catch (err) {
    console.error("Error rejecting trainee:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const traineeConfirm = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training not found" });

    if (!training.acceptedtrainees) training.acceptedtrainees = [];
    if (!training.confirmedtrainees) training.confirmedtrainees = [];

    const { trainee } = req.body; 

    if (!trainee) {
      return res.status(400).json({ message: "Trainee ID is required" });
    }
    if (
      training.acceptedtrainees.includes(trainee) &&
      !training.confirmedtrainees.includes(trainee)) {
      training.confirmedtrainees.push(trainee);

      training.nbOfConfirmedRequests = training.confirmedtrainees.length;

      await training.save();

      notifyManagers(trainee, 'Trainee_Confirmed_Attendance', req.params.id.toString());
      deleteNotifFromManagers(trainee, "Request_Accepted", req.params.id.toString());
      res.json({ message: "Trainee confirmed attendance", training });
    } else {
      return res.status(400).json({ message: "Trainee already confirmed" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTrainee = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }
    const { trainee, managerdeleted } = req.body;
    if (!trainee) {
      return res.status(400).json({ message: "Trainee ID is required" });
    }
    training.acceptedtrainees = training.acceptedtrainees.filter(
      t => t?.toString() !== trainee.toString()
    );
    training.confirmedtrainees = training.confirmedtrainees.filter(
      t => t?.toString() !== trainee.toString()
    );
    training.nbOfAcceptedRequests = training.acceptedtrainees.length;
    training.nbOfConfirmedRequests = training.confirmedtrainees.length;
    if(!training.rejectedtrainees.includes(trainee))training.rejectedtrainees.push(trainee);
    await training.save();
    notify(trainee, managerdeleted, "Deleted_Trainee_From_Training", req.params.id.toString());
    deleteNotifFromUser(trainee, "Trainee_Confirmed_Attendance", req.params.id.toString());

    res.json({ message: "Trainee deleted successfully", training });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cold And Hot Feedbacks

const getFeedbacks = async (req, res) => {
  try {
    const { trainee } = req.body;
    const trainingId = req.params.id;

    const query = { training: trainingId };
    if (trainee) query.trainee = trainee;

    const coldFeedback = await ColdFeedback.find(query);
    const hotFeedback = await HotFeedback.find(query);

    res.status(200).json({ coldFeedback, hotFeedback });
  } catch (error) {
    console.error("Error getting feedbacks:", error);
    res.status(500).json({ message: "Server error while fetching feedbacks" });
  }
};


const sendColdRequest = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training not found" });

    const { manager } = req.body;

    for (const traineeId of training.confirmedtrainees) {
      const trainee = await User.findById(traineeId);
      if (!trainee) continue;
    
      const alreadySent = await ColdFeedback.findOne({
        trainee: traineeId,
        training: req.params.id,
      });
    
      if (alreadySent) continue;

      const alreadyHaveNotif = trainee.trainingsCanSendColdFeedback.includes(req.params.id);

      if (alreadyHaveNotif) continue;
    
      trainee.trainingsCanSendColdFeedback.push(req.params.id);
      await trainee.save();
    
      notify(traineeId, manager, "Request_Cold_Feedback", req.params.id.toString());
    }
    

    res.status(200).json({ message: "Trainees notified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendHotRequestForTraining = async (trainingId, manager = null) => {
  const training = await Training.findById(trainingId);
  if (!training) {
    console.warn(`Training ${trainingId} not found`);
    return;
  }

  for (const traineeId of training.confirmedtrainees) {
    const trainee = await User.findById(traineeId);
    if (!trainee) continue;

    const alreadySent = await HotFeedback.findOne({
      trainee: traineeId,
      training: trainingId,
    });

    if (alreadySent) continue;

    const alreadyHaveNotif = trainee.trainingsCanSendHotFeedback.includes(trainingId);

    if (alreadyHaveNotif) continue;

    trainee.trainingsCanSendHotFeedback.push(trainingId);
    await trainee.save();

    notify(traineeId, manager, "Request_Hot_Feedback", trainingId.toString());
  }
};

const sendHotRequest = async (req, res) => {
  try {
    await sendHotRequestForTraining(req.params.id, req.body.manager);
    res.status(200).json({ message: "Trainees notified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getLastSessionDate = async (trainingId) => {
  try {
    const latestSession = await Session.findOne({ training: trainingId })
      .sort({ date: -1 }) 
      .select('date'); 

    if (!latestSession) {
      console.log('No sessions found for this training.');
      return null;
    }

    console.log('Latest session date:', latestSession.date);
    return latestSession.date;

  } catch (error) {
    console.error('Error fetching latest session:', error);
    return null;
  }
};
const getFirstSessionDateFromBody = (daysString, monthName) => {
  try {
    const currentYear = new Date().getFullYear();
    const daysArray = daysString.split(' ').map(Number); 

    if (daysArray.length === 0) {
      console.log('No days provided.');
      return null;
    }
    const monthIndex = new Date(`${monthName} 1, ${currentYear}`).getMonth();

    if (isNaN(monthIndex)) {
      console.log('Invalid month name.');
      return null;
    }

    const firstDay = Math.min(...daysArray);

    const firstDate = new Date(currentYear, monthIndex, firstDay);
    console.log('First session date:', firstDate);
    return firstDate;
  } catch (error) {
    console.error('Error parsing session date from body:', error);
    return null;
  }
};

const getFirstSessionPresentTraineesCount = async (trainingId) => {
  try {
    const firstSession = await Session.find({ training: trainingId })
      .sort({ date: 1 })
      .limit(1)
      .populate("presenttrainees");

    if (!firstSession.length) {
      console.log("No sessions found for this training.");
      return 0;
    }

    const count = firstSession[0].presenttrainees?.length || 0;
    console.log(`Present trainees in first session: ${count}`);
    return count;
  } catch (error) {
    console.error("Error getting present trainees in first session:", error);
    return 0;
  }
};


cron.schedule('* * * * *', async () => {
  try {
    const trainingIds = await Session.distinct('training');

    for (const trainingId of trainingIds) {
      const latestDate = await getLastSessionDate(trainingId);
      if (!latestDate) continue;

      const now = new Date();
      const fifteenMinutesAfter = new Date(latestDate.getTime() + 15 * 60 * 1000);

      if (now >= fifteenMinutesAfter) {
        await sendHotRequestForTraining(trainingId, null);
        const training = await Training.findById(trainingId);
        if (!training) continue;
        training.delivered = true;
        const presentCount = await getFirstSessionPresentTraineesCount(trainingId);
        if (presentCount > 0) {
          training.costPerTrainee = training.costPerTrainer / presentCount;
        } else {
          training.costPerTrainee = 0;
        }
        await training.save();
      }
    }
  } catch (err) {
    console.error('Error in scheduled notification cleanup:', err);
  }
});

// Add quiz ...........

const uploadQuiz = async (req, res) => {
  try {
    const { trainingId, type,trainer } = req.body;

    if (!trainingId || !type) {
      return res.status(400).json({ message: "Missing trainingId or type" });
    }

    const fileBuffer = req.file?.buffer;
    const contentType = req.file?.mimetype;  
    const fileName = req.file?.originalname; 

    if (!fileBuffer) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    training.quiz= {
      data: fileBuffer,
      contentType: contentType,
      fileName: fileName,
      type: type,
    };

    training.confirmedtrainees.forEach((trainee) => {
      notify(trainee,trainer , "Quiz_Uploaded_From_Trainer", trainingId.toString());
    })

    await training.save();
    res.status(200).json({ message: "quiz saved successfully" });
  } catch (err) {
    console.error("Error during quiz upload:", err);
    res.status(500).json({ message: err.message });
  }
};


const getQuizFile = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    const { trainee } = req.body;

    let fileBuffer;
    let fileName;
    let contentType;

    if (training.quiz?.data) {
      fileBuffer = training.quiz.data;
      fileName = training.quiz.fileName; 
      contentType = training.quiz.contentType || 'application/octet-stream';  
    } else {
      return res.status(404).json({ message: "No quiz file found" });
    }

    res.setHeader('Content-Type', contentType); 
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`); 

    deleteNotif(trainee,training.trainer, "Quiz_Uploaded_From_Trainer", null);

    res.send(fileBuffer);
  } catch (err) {
    console.error("Error during quiz file retrieval:", err);
    res.status(500).json({ message: err.message });
  }
};






module.exports = {getTrainings, getTrainingById, createTraining, updateTrainingById , deleteTrainingById, addTraineeReq, 
  acceptTraineeReq,rejectTraineeReq,deleteTrainee,traineeConfirm,getFeedbacks, sendColdRequest, sendHotRequest, uploadQuiz, getQuizFile, updateAll}