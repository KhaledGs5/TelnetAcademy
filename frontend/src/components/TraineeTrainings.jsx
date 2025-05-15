import React, { useState, useEffect } from "react";
import { useLanguage } from "../languagecontext";
import FormSubmit from './FormSubmit';
import { Box, TextField , Typography, Button,Input,IconButton, InputAdornment, Tooltip, OutlinedInput, FormControl, InputLabel, Pagination,Radio, Alert, Snackbar , Autocomplete, Popover,Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Checkbox, FormControlLabel,Rating, Badge, Grid, Select  } from "@mui/material";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import FeedIcon from '@mui/icons-material/Feed';
import AddIcon from '@mui/icons-material/Add';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import StarIcon from '@mui/icons-material/Star';
import DoneIcon from '@mui/icons-material/Done';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { useUser } from '../UserContext';
import dayjs from 'dayjs';
import api from "../api";
import { useNavbar } from '../NavbarContext';

const TraineeTrainings = () => {

  const { t } = useLanguage();
  const [selectedTrainingId, setSelectedTrainingId] = useState(true);

  const [time, setTime] = useState(dayjs().format("YYYY-MM-DD hh:mm A"));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs().format("YYYY-MM-DD hh:mm A"));
    }, 1000); 
    return () => clearInterval(interval); 
  }, []);
  


  // Fetch All Trainings with corresponding sessions
  const [trainings, setTrainings] = useState([]);
    const [numberOfPending, setNumberOfPending] = useState(0);
    const [numberOfApproved, setNumberOfApproved] = useState(0);
    const [numberOfRejected, setNumberOfRejected] = useState(0);
  
  const { user } = useUser();

  const updateStatus = () => {
    trainings.forEach((training) => {
        training.sessions.forEach((session) => {
            api.put(`/api/sessions/${session._id}`, session)
                .then((response) => {})
                .catch((error) => {});
        });
        });
  };

  const { setNumberOfDeletedTrainee } = useNavbar();

  const handleOpenDeletedTraineeNotifications = async () => {
    try {
      await api.delete("/api/notifications", {
        data: {
          rec: user?._id,
          tp: "Deleted_Trainee_From_Training",
        }
      });
      setNumberOfDeletedTrainee(0);
    } catch (error) {
      console.error("Error marking notifications as read", error);
    }
  };

  const handleOpenRejectResponsesNotifications = async () => {
    try {
      await api.delete("/api/notifications", {
        data: {
          rec: user?._id,
          tp: "Request_Rejected",
        }
      });
    } catch (error) {
      console.error("Error marking notifications as read", error);
    }
  };
  
  useEffect(() => {
    updateStatus();
    handleOpenDeletedTraineeNotifications();
    handleOpenRejectResponsesNotifications();
  }, [user]);

  const [requestResponseTrainings,setRequestResponseTrainings] = useState([])

  const fetchTrainings = async () => {
    api.get("/api/trainings")
        .then((response) => {
            const trainingsWithModified = response.data
            .filter(
                training => training.trainer !== user?._id
                && (
                training.traineesrequests.some(request => request.trainee === user?._id) 
                || training.acceptedtrainees.includes(user?._id)
                || training.rejectedtrainees.includes(user?._id)
            ))
            .map(training => ({
                ...training,
                sessions: [],
                status: training.traineesrequests.some(request => request.trainee === user?._id)
                ? "pending"
                : training.confirmedtrainees.includes(user?._id)
                ? "confirmed"
                : training.acceptedtrainees.includes(user?._id)
                ? "approved"
                : training.rejectedtrainees.includes(user?._id)
                ? "rejected"
                : ""
            }));
            let pendingCount = 0;
            let approvedCount = 0;
            let rejectedCount = 0;
            trainingsWithModified.forEach(training => {
                if (training.status === "pending") pendingCount++;
                if (training.status === "approved" || training.status === "confirmed") approvedCount++;
                if (training.status === "rejected") rejectedCount++;
            });
            setNumberOfPending(pendingCount);
            setNumberOfApproved(approvedCount);
            setNumberOfRejected(rejectedCount);

            setTrainings(trainingsWithModified);

            trainingsWithModified.forEach((training) => {
                api.get(`/api/sessions/training/${training._id}`)
                    .then((response) => {
                        const updatedSessions = response.data.map(session => ({
                            ...session,
                        }));
                        setTrainings((prevTrainings) =>
                            prevTrainings.map((t) =>
                                t._id === training._id ? { ...t, sessions: updatedSessions } : t
                            )
                        );
                    })
                    .catch((error) => {
                        console.error("Error fetching sessions:", error);
                    });
            });
        })
        .catch((error) => {
            console.error("Error fetching trainings:", error);
        });
        await api.post("/api/notifications/noread", { rec: user?._id })
        .then((response) => {
          const messages = response.data.notifications
            .filter(notification => 
              notification.type === "Request_Accepted" || notification.type === "Request_Rejected"
            )
            .map(notification => notification.message);
      
          setRequestResponseTrainings(messages);
        });
  };

    console.log(requestResponseTrainings);
        const formatDaysWithMonth = (dateString, month) => {
        if (!dateString) return "";

        const days = dateString.split(" ").map(Number);

        const getDayWithSuffix = (day) => {
            if (day >= 11 && day <= 13) return `${day}th`; 
            const lastDigit = day % 10;
            if (lastDigit === 1) return `${day}st`;
            if (lastDigit === 2) return `${day}nd`;
            if (lastDigit === 3) return `${day}rd`;
            return `${day}th`;
        };

        const formattedDays = days.map(getDayWithSuffix);
        const finalDaysFormat = formattedDays.length > 1 
            ? formattedDays.slice(0, -1).join(", ") + " and " + formattedDays.slice(-1) 
            : formattedDays[0];

        return `${finalDaysFormat} ${month}`;
    };

    // handle changings in trainings

    const getTrainingById = (id) => {
        return Object.values(trainings).find(training => training._id === id) || null;
    };

  // Verify Update Or Create Training...........

  const [showsVerificationAlert, setShowsVerifificationAlert] = useState(false);
  const [verifyAlertMessage, setVerifyAlertMessage] = useState("");
  const [verifyAlert, setVerifyAlert] = useState("error");
  const handleVerificationAlertClose = () => {
      setShowsVerifificationAlert(false);
  };


    const [TrainingTrainers, setTrainingTrainers] = useState([]); 


    // show training details by Id............
    const [showTraining, setShowTraining] = useState(false);

    const showTrainingDetails = (trainingId) => {
        setShowTraining(true);
        setSelectedTrainingId(trainingId);
    };

    const hideTrainingDetails = () => {
        setShowTraining(false);
    };

    // Confirm Attendance..............
    const [verifyAttendance, setVerifyAttendance] = useState(false);

    const showVerifyAttendanceDialog = (trainingId) => {
        setSelectedTrainingId(trainingId);
        setVerifyAttendance(true);
    };

    const hideVerifyAttendanceDialog = () => {
        setVerifyAttendance(false);
    };

    const handleAttendanceVerification = () => {
        api.put(`/api/trainings/confirm/${selectedTrainingId}`, {trainee:user?._id})
            .then(() => {
                const recipients = [user?.email];
                const training = getTrainingById(selectedTrainingId);
                training.sessions.forEach((session, i) => {
                    const sessionDate = new Date(session.date); 
                    const sessionEnd = new Date(sessionDate.getTime() + session.duration * 60 * 60 * 1000);
                    const eventDetails = {
                        start: sessionDate, 
                        end: sessionEnd, 
                        summary: session.name || training.title,
                        description: training.description || 'Training session',
                        location: session.location || training.location,
                        url: 'http://localhost:3000/trainertraining',
                    };

                    api.post("/send-calendar-event", {
                        recipients,
                        eventDetails,
                    });
                });
                setVerifyAlert("success");
                setVerifyAlertMessage("attendance_confirmed_successfully");
                setShowsVerifificationAlert(true);
                hideVerifyAttendanceDialog();
                fetchTrainings();
            })
    }

    // Requests Responses ...........

    const {setNumberOfRequestsReponses} = useNavbar();

    const handleOpenRequestsResponsesNotification = async () => {
        try {
          await api.put("/api/notifications/markread", {rec : user?._id, tp : "Request_Accepted", rtp : "readRequestsResponsesNotifications"});
          await api.put("/api/notifications/markread", {rec : user?._id, tp : "Request_Rejected", rtp : "readRequestsResponsesNotifications"});
          setNumberOfRequestsReponses(0);
        } catch (error) {
          console.error("Error marking notifications as read", error);
        }
    };

    //Give feedback ...........
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState("cold_feedback");
    const [canAddColdFeedback, setCanSendColdFeedback] = useState([]);
    const [canAddHotFeedback, setCanSendHotFeedback] = useState([]);
    const {numberOfNewFeedbacksReq ,setNumberOfNewFeedbacksReq } = useNavbar();
    const [trainingsHaveFeedbackReq, setTrainingsHaveFeedbackReq] = useState([]);

    useEffect(() => {
        const fetchTrainingsFeedbacks = async () => {
          try {
            const types = ["Request_Cold_Feedback", "Request_Hot_Feedback"];
            let allNotifications = [];
      
            for (let tp of types) {
              const res = await api.post("/api/notifications/withtype", {
                rec: user?._id,
                tp,
              });
              allNotifications = [...allNotifications, ...res.data.notifications];
            }
      
            allNotifications.forEach((notif) => {
              setTrainingsHaveFeedbackReq((prev) => [...prev, notif.message]);
            });
          } catch (error) {
            console.error("Failed to fetch feedback notifications:", error);
          }
        };
      
        fetchTrainingsFeedbacks();
    }, [user]); 

    const changeFeedbackAvailabilty = () => {
        api.get(`/api/users/${user?._id}`)
            .then((response) => {
                setCanSendColdFeedback(response.data.trainingsCanSendColdFeedback);
                setCanSendHotFeedback(response.data.trainingsCanSendHotFeedback);
            })
    }

    useEffect(() => {
        if(user)changeFeedbackAvailabilty();
    }, [user]);


    const showFeedbackDialog = (trainingId) => {
        setSelectedTrainingId(trainingId);
        setShowFeedback(true);
        setHotFeedback({
            theme:getTrainingById(trainingId)?.title,
            trainer: TrainingTrainers.find(trainer => trainer.id === getTrainingById(trainingId)?.trainer)?.name || "" ,
            trainingDate: formatDaysWithMonth(getTrainingById(trainingId)?.date, t(getTrainingById(trainingId)?.month)),
            location: getTrainingById(trainingId)?.location,
            objectivesCommunication: 1,
            trainingOrganization: 1,
            groupComposition: 1,
            materialAdequacy: 1,
            programCompliance: 1,
            contentClarity: 1,
            materialQuality: 1,
            trainingAnimation: 1,
            trainingProgress: 1,
            metExpectations: 1,
            objectivesAchieved: 1,
            exercisesRelevance: 1,
            willApplySkills: 1,
        });
        setColdFeedback({
            theme:getTrainingById(trainingId)?.title,
            trainer: TrainingTrainers.find(trainer => trainer.id === getTrainingById(trainingId)?.trainer)?.name || "" ,
            trainingDate: formatDaysWithMonth(getTrainingById(trainingId)?.date, t(getTrainingById(trainingId)?.month)),
            location: getTrainingById(trainingId)?.location,
            appliedKnowledge: false,
            improvedWorkEfficiency: false,
        });
    };

    const hideFeedbackDialog = () => {
        setShowFeedback(false);
    };

    const [hotFeedback, setHotFeedback] = useState({
        theme: "",
        association: "",
        trainer: "",
        trainingDate: "",
        location: "",
        // objectivesCommunication: 1,
        // trainingOrganization: 1,
        // groupComposition: 1,
        // materialAdequacy: 1,
        // programCompliance: 1,
        // contentClarity: 1,
        // materialQuality: 1,
        // trainingAnimation: 1,
        // trainingProgress: 1,
        // metExpectations: 1,
        // objectivesAchieved: 1,
        // exercisesRelevance: 1,
        // willApplySkills: 1,
        // comments: "",
    });
    

    const [coldFeedback, setColdFeedback] = useState({ 
        theme: "",
        association: "",
        trainer: "", 
        trainingDate: "",
        location: "",
        name: "",
        matricule: "",
        function: "", 
        service: "",
        // appliedKnowledge: false,
        // knowledge: "",
        // whyNotApplied: "", 
        // otherWhyNotApplied: "",
        // improvedWorkEfficiency: false,
        // improvment: "",
        // whyNotImproved: "",
        // trainingImprovementsSuggested: "",
        // comments: "",
    });

    const [formFields, setFormFields] = useState([]);
    const [fieldValues, setFieldValues] = useState({});

    const fetchForms = async () => {
        try {
          const response = await api.get("/api/dynamicform/forms")
          const form =  response.data.forms.filter((form) => form.type === feedbackType);
          setFormFields(form[0].fields);
        } catch (error) {
          console.error('Error getting forms', error);
          throw error;
        }
      };

    useEffect(() => {
        fetchForms();
    }, [feedbackType,user]);

    
    const handleColdFeedbackChange = (field, value) => {
        setColdFeedback((prev) => ({ ...prev, [field]: value }));
    };

    const handleHotFeedbackChange = (field, value) => {
        setHotFeedback((prev) => ({ ...prev, [field]: value }));
    };

    const handleOpenColdFeedbackReqNotification = async () => {
        try {
            await api.put("/api/notifications/markread", {rec : user?._id, tp : "Request_Cold_Feedback", rtp : "readFeedbackReqNotifications"});
            setNumberOfNewFeedbacksReq(0);
          } catch (error) {
            console.error("Error marking notifications as read", error);
          }
    };

    const handleOpenHotFeedbackReqNotification = async () => {
        try {
            await api.put("/api/notifications/markread", {rec : user?._id, tp : "Request_Hot_Feedback", rtp : "readFeedbackReqNotifications"});
            setNumberOfNewFeedbacksReq(0);
          } catch (error) {
            console.error("Error marking notifications as read", error);
          }
    };

    const handleFeedbackSubmission = () => {
        if(feedbackType === "cold_feedback"){
            const responses = Object.entries(fieldValues).map(([fieldId, value]) => ({
                fieldId,
                value
              }));
            api.post("/api/coldfeedback", {
                ...coldFeedback,
                trainee: user?._id,
                training: selectedTrainingId,
                responses,
            })
            .then(async () => {
                await api.delete("/api/notifications", { data : {rec : user?._id, tp : "Request_Cold_Feedback", msg: selectedTrainingId.toString()}});
                setVerifyAlert("success");
                setVerifyAlertMessage("feedback_sent_successfully");
                setShowsVerifificationAlert(true);
                hideFeedbackDialog();
                changeFeedbackAvailabilty();
            })
            .catch((error) => {
                console.error("Error sending feedback:", error);
            });
        }else if(feedbackType === "hot_feedback"){
            const responses = Object.entries(fieldValues).map(([fieldId, value]) => ({
                fieldId,
                value
              }));
            api.post("/api/hotfeedback", {
                ...hotFeedback,
                trainee: user?._id,
                training: selectedTrainingId,
                responses,
            })
            .then(async () => {
                await api.delete("/api/notifications", { data : {rec : user?._id, tp : "Request_Hot_Feedback", msg: selectedTrainingId.toString()}});
                setVerifyAlert("success");
                setVerifyAlertMessage("feedback_sent_successfully");
                setShowsVerifificationAlert(true);
                hideFeedbackDialog();
                changeFeedbackAvailabilty();
            })
            .catch((error) => {
                console.error("Error sending feedback:", error);
            });
        }
    }

    // Add And Download Quiz ...............

    const {numberOfQuizFromTrainer, setNumberOfQuizFromTrainer }= useNavbar();

    const handleOpenTrainerQuizNotification = async () => {
        try {
            await api.put("/api/notifications/markread", {rec : user?._id, tp : "Quiz_Uploaded_From_Trainer", rtp : "readTrainerQuizNotifications"});
            setNumberOfQuizFromTrainer(0); 
        } catch (error) {
            console.error("Error marking notifications as read", error);
        }
    };
    const [addQuiz, setAddQuiz] = useState(false);

    const showAddQuiz = (trainingId) => {
        handleOpenTrainerQuizNotification();
        setSelectedTrainingId(trainingId);
        setAddQuiz(true);
    }

    const hideAddQuiz = () => {
        setAddQuiz(false);
    }

    const downloadQuizFile = async () => {
        try {
            console.log(selectedTrainingId);
            const response = await api.post(`/api/trainings/get-quiz-file/${selectedTrainingId}`, 
                {
                    trainee: user?._id,
                },
                {
                    responseType: 'blob' 
                }
        );

            const contentType = response.headers['content-type'];
            let fileExtension = '';
            if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                fileExtension = '.docx';
            } else if (contentType.includes('application/pdf')) {
                fileExtension = '.pdf'; 
            } else if (contentType.includes('image')) {
                fileExtension = '.jpg';  
            } else {
                fileExtension = ''; 
            }
    
            const fileURL = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = fileURL;

            link.setAttribute('download', `quiz_file${fileExtension}`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error("Failed to download file", err);
        }
    };
    

    const [file, setFile] = useState(null);               

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
        formData.append('trainingId', selectedTrainingId);
        formData.append('userId', user?._id);
    
        for (let pair of formData.entries()) {
            console.log(pair[0]+ ': ' + pair[1]);
        }
    
        try {
            await api.put('/api/users/upload-quiz', formData);
            setVerifyAlertMessage(t("quiz_sent_successfully"));
            setVerifyAlert("success");
            setShowsVerifificationAlert(true);
            hideAddQuiz();
        } catch (error) {
            setVerifyAlertMessage(error.response.data.error);
            setVerifyAlert("error");
            setShowsVerifificationAlert(true);
            hideAddQuiz();
        }
    };
      
    // Order ........................
    const [orderState, setOrderState] = useState('Down');
    const [trainingOrderState, setTrainingOrderState]= useState('Down');  
    const [selectedOrder, setSelectedOrder] = useState("Name");
    const [selectedTrainingOrder, setSelectedTrainingOrder] = useState("createdAt");

    const handleChangeOrder = (sel) => {
        setOrderState(orderState === 'Up' ? 'Down' : 'Up');
        setSelectedOrder(sel);
    };

    const handleChangeTrainingOrder = (sel) => {
        setTrainingOrderState(trainingOrderState === 'Up' ? 'Down' : 'Up');
        setSelectedTrainingOrder(sel);
    };

    // Filters ....................
    const TrainingStatusColors = {
        "pending": '#90CAF9',
        "approved": '#A5D6A7',
        "confirmed": '#A5D6A7',
        "rejected":'#FFCDD2',
    }

    const [selectedFilter, setSelectedFilter] = useState("all");
    const [searchedTitle, setSearchedTitle] = useState('');
    const [applyFilter, setApplyFilter] = useState(false);
    const [otherFilterLocation, setOtherFilterLocation] = useState(false);

    const FilterMonths = [
        "all", "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];    
    const [selectedMonth, setSelectedMonth] = useState("all");

    const FilterLocations = ['all', 'Telnet Sfax', 'Telnet Tunis Lac', 'Telnet Tunis CDS', 'Microsoft Teams']
    const [selectedLocation, setSelectedLocation] = useState("all");

    const FilterModes = ['all', 'online', 'face_to_face', 'hybrid']
    const [selectedMode, setSelectedMode] = useState("all");

    const FilterSkillTypes = ['all', 'technical_skill', 'soft_skill']
    const [selectedSkillType, setSelectedSkillType] = useState("all");
    
    const FilterTypes = ['all', 'internal', 'external']
    const [selectedType, setSelectedType] = useState("all");

    const [FilterTrainer, setFilterTrainer] = useState([{ name: 'all', id: 0 }]);
    const [selectedTrainer, setSelectedTrainer] = useState(0);

    const fetchTrainers = async () => {
        try {
        const response = await api.get('/api/users');
        if (response.status === 200) {
            const trainers = response.data
            .filter(user => user?.role === "trainer" || user?.role === "trainee_trainer")
            .map(user => ({ name: user?.name, id: user?._id }));
    
            setFilterTrainer([{ name: 'all', id: 0 }, ...trainers]);
            setTrainingTrainers(trainers);
        }
        } catch (error) {
        console.error("Error fetching trainers:", error);
        }
    };

    useEffect(() => {
        fetchTrainers();
        fetchTrainings();
    }, [user]);

    const handleSearchChange = (e) => {
        setSearchedTitle(e.target.value);
    };

    const handleClearSearch = () =>{
        setSearchedTitle(''); 
    };

    const filteredTrainings = Object.entries(trainings)
    .filter(([_, training]) => training !== undefined)
    .map(([key, training]) => ({ id: key, ...training }))
    .filter(training => 
        training &&
        training.title &&
        training.title.toLowerCase().includes(searchedTitle.toLowerCase()) && 
        (!applyFilter || ( 
            (selectedMonth === training.month || selectedMonth === "all") &&
            (selectedLocation === training.location || selectedLocation === "all") &&
            (selectedMode === training.mode || selectedMode === "all") &&
            (selectedSkillType === training.skillType || selectedSkillType === "all") &&
            (selectedType === training.type || selectedType === "all") &&
            (selectedTrainer === training.trainer || selectedTrainer === 0)
        ))
    &&
    ((selectedFilter === "all") || (selectedFilter === training.status) || ((selectedFilter === "approved") && (training.status === "confirmed")))
        ).sort((ftraining, straining) => {
        if (
        selectedTrainingOrder &&
        ((ftraining[selectedTrainingOrder.toLowerCase()] !== undefined || ftraining[selectedTrainingOrder] !== undefined) &&
        (straining[selectedTrainingOrder.toLowerCase()] !== undefined || straining[selectedTrainingOrder] !== undefined))
        ) {
        if (selectedTrainingOrder.toLowerCase() === "createdat") {
            const ftrainingDate = new Date(ftraining[selectedTrainingOrder]);
            const strainingDate = new Date(straining[selectedTrainingOrder]);
            return trainingOrderState === "Down"
            ? ftrainingDate - strainingDate
            : strainingDate - ftrainingDate;
        }else if (selectedTrainingOrder.toLowerCase() === "title"){
            return trainingOrderState === "Down"
            ? ftraining[selectedTrainingOrder.toLowerCase()].toLowerCase().localeCompare(straining[selectedTrainingOrder.toLowerCase()].toLowerCase())
            : straining[selectedTrainingOrder.toLowerCase()].toLowerCase().localeCompare(ftraining[selectedTrainingOrder.toLowerCase()].toLowerCase());
        }else if (selectedTrainingOrder.toLowerCase() === "nbofparticipants"){
            return trainingOrderState === "Down"
            ? ftraining[selectedTrainingOrder] - (straining[selectedTrainingOrder])
            : straining[selectedTrainingOrder] - (ftraining[selectedTrainingOrder]);
        }
        }
    });

        
    // Pagination ...............
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);  

    const handlePageChange = (event, value) => {
        setPage(value);
    };
    const pageCount = Math.ceil(filteredTrainings.length / itemsPerPage);
    const displayedTrainings = filteredTrainings.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    
    

    // Styles ..............

    const buttonStyle = {
      color: 'black',
      backgroundColor: 'button.tertiary',
      borderRadius: '10px',
      textDecoration: 'none',
      textAlign: 'start',
      fontWeight: 'bold',
      fontSize: '16px',
      lineHeight: 1.2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '140px',
      height: '70px',
      fontWeight: 'bold',
      textTransform: "none",
      '&:hover': {
        backgroundColor: '#76C5E1',
      }
    };

    const orderStyle = {
      color: "text.primary",
      textTransform: "none",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    };

    return (
        <Box
          sx={{
            width: '96%',
            height: 'auto',
            boxSizing: 'border-box',
            backgroundColor: "background.paper",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "start",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
            borderRadius: '10px',
            position: "absolute",
            left: '2%',
            top: '15%',
            padding: '30px',
            gap: "10px",
        }}
        >
            <Box
                sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "start",
                alignItems: "center",
                width: "100%",
                height: "100px",
                }}
            >
                <Typography
                    sx={{
                        fontSize: 34,
                        fontWeight: "bold",
                        textAlign: "center",
                        letterSpacing: 0.2,
                        lineHeight: 1,
                        userSelect: "none",
                        cursor: "pointer",
                        color: "#2CA8D5",
                        marginLeft: 5,
                    }}
                >
                    {t("enrolled_trainings")}
                </Typography>
                 <Box
                     sx={{
                     position: 'absolute',
                     left: '30%',
                     display: "flex",
                     flexDirection: "row",
                     justifyContent: "space-between",
                     alignItems: "center",
                     gap: '20px',
                     }}
                 >
                    <Button 
                        sx={buttonStyle}
                        onClick={() => setSelectedFilter("all")}
                    >
                    {selectedFilter === "all" && (
                        <Box
                        sx={{
                            width: 12,
                            height: 12, 
                            backgroundColor: "#2CA8D5", 
                            borderRadius: "50%",
                            position: "absolute",
                            top: 10, 
                            right: 10, 
                            boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)", 
                        }}
                        />
                    )}
                        {t("all")}
                    </Button>
                    <Button 
                        sx={{...buttonStyle, backgroundColor : "#90CAF9"}}
                        onClick={() => setSelectedFilter("pending")}
                    >
                    {selectedFilter === "pending" && (
                        <Box
                        sx={{
                            width: 12,
                            height: 12, 
                            backgroundColor: "#2CA8D5", 
                            borderRadius: "50%",
                            position: "absolute",
                            top: 10, 
                            right: 10, 
                            boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)", 
                        }}
                        />
                    )}
                        {numberOfPending}<br/>{t("pending")}
                    </Button>
                    <Button 
                    sx={{
                        ...buttonStyle,
                        backgroundColor: "#A5D6A7",
                        position: "relative",
                    }}
                    onClick={() => setSelectedFilter("approved")}
                    >
                    {selectedFilter === "approved" && (
                        <Box
                        sx={{
                            width: 12,
                            height: 12, 
                            backgroundColor: "#2CA8D5", 
                            borderRadius: "50%",
                            position: "absolute",
                            top: 10, 
                            right: 10, 
                            boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)", 
                        }}
                        />
                    )}
                    {numberOfApproved}
                    <br />
                    {t("approved")}
                    </Button>
                    <Button 
                        sx={{...buttonStyle, backgroundColor:"#FFCDD2"}}
                        onClick={() => setSelectedFilter("rejected")}
                    >
                    {selectedFilter === "rejected" && (
                        <Box
                        sx={{
                            width: 12,
                            height: 12, 
                            backgroundColor: "#2CA8D5", 
                            borderRadius: "50%",
                            position: "absolute",
                            top: 10, 
                            right: 10, 
                            boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)", 
                        }}
                        />
                    )}
                        {numberOfRejected}<br/>{t("rejected")}
                    </Button>
                    <FormControl sx={{ marginLeft: 2, minWidth: 200 }} size="small">
                        <InputLabel id="number-select-label">{t("trainings_per_page")}</InputLabel>
                        <Select
                        labelId="number-select-label"
                        value={itemsPerPage} 
                        label={t("trainings_per_page")}
                        onChange={(e) => setItemsPerPage(e.target.value)} 
                        >
                        {Array.from({ length: 16 }, (_, i) => i + 5).map((num) => (
                            <MenuItem key={num} value={num}>{num}</MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            <Box
                sx={{
                    width: '100%',
                    position: "sticky",
                    top: 0,
                    backgroundColor: "background.paper",
                    zIndex: 2,
                    height: 'auto',
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: '5px',
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: '100%',
                        height: '70px',
                        gap: '20px',
                    }}
                >
                    <Button
                        sx={{...orderStyle, width: '15%', minWidth: '200px'}}
                        onClick={() => handleChangeTrainingOrder("createdAt")}
                    >
                        <Typography>
                            {t("sort_by_date_added")}
                        </Typography>
                        {selectedTrainingOrder === "createdAt" ? (trainingOrderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Input
                        placeholder={t("search_by_title")}
                        value={searchedTitle}
                        onChange={handleSearchChange}
                        sx={{
                            width: '20%'
                        }}
                        startAdornment={
                            <InputAdornment position="start">
                                <IconButton size="small">
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                        endAdornment={
                            searchedTitle && (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClearSearch} size="small">
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    >
                    </Input>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: '100%',
                        height: '70px',
                        gap: '20px',
                    }}
                >
                    <Button
                    sx={{
                        ...buttonStyle, width:'Auto', height:'55px', textTransform: 'none',
                        fontSize: 15, fontWeight: 'bold', backgroundColor: applyFilter ? '#2CA8D5 ': 'button.tertiary', 
                        color: 'text.primary', borderRadius: '10px', gap: '10px', padding : '10px',
                        minWidth: '180px',       whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                    onClick={() => setApplyFilter(!applyFilter)}
                    >
                    {applyFilter ? <FilterAltIcon/> : <FilterAltOffIcon/>}
                    {applyFilter ? t("disable_filter") : t("apply_filter")}
                    </Button>
                    <TextField
                        select
                        label={t("month")}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                                disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterMonths.map((month) => (
                            <MenuItem key={month} value={month}>
                                {t(month)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select={!otherFilterLocation  && (FilterLocations.includes(selectedLocation) || selectedLocation === "")}
                        label={t("location")}
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                                disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterLocations.map((location) => (
                            <MenuItem key={location} value={location}>
                                {t(location)}
                            </MenuItem>
                        ))}
                        <Button 
                            sx={{
                                width: "100%",
                                textTransform: "none",
                                color: "black",
                            }}
                            onClick={() => 
                                setOtherFilterLocation(true)}
                        >
                            {t("other")}...
                        </Button>
                    </TextField>
                    <Dialog
                        open={otherFilterLocation}
                        onClose={() => setOtherFilterLocation(false)}
                        disableScrollLock={true}
                        PaperProps={{
                            sx: {
                                width: "auto",  
                                height: "auto", 
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: "10px",
                                padding: '20px',
                            }
                        }}
                    >
                        <FormControl variant="outlined" sx={{ 
                                width: '200px',
                            }}
                        >
                            <InputLabel required>{t("location")}</InputLabel>
                            <OutlinedInput
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                label="Activity  ................"
                            />
                        </FormControl>
                        <Button
                            sx={{
                                color: 'white',
                                backgroundColor: '#2CA8D5',
                                padding: '5px 10px',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                width: '100px',
                                height: '40px',
                                marginTop: '10px',
                                textTransform: "none",
                                '&:hover': {
                                    backgroundColor: '#76C5E1',
                                    color: 'white',
                                },
                            }}
                            onClick={() => {
                                setOtherFilterLocation(false);
                            }}
                        >
                            {t("save")}
                        </Button>
                    </Dialog>
                    <TextField
                        select
                        label={t("mode")}
                        value={selectedMode}
                        onChange={(e) => setSelectedMode(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                                disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterModes.map((mode) => (
                            <MenuItem key={mode} value={mode}>
                                {t(mode)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={t("skill")}
                        value={selectedSkillType}
                        onChange={(e) => setSelectedSkillType(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                                disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterSkillTypes.map((skill) => (
                            <MenuItem key={skill} value={skill}>
                                {t(skill)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={t("type")}
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                                disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {t(type)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={t("trainer")}
                        value={selectedTrainer}
                        onChange={(e) => setSelectedTrainer(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                                disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterTrainer.map((trainer) => (
                            <MenuItem key={trainer.id} value={trainer.id}>
                                {t(trainer.name)}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
                <Box
                    sx={{
                        width: '100%',
                        height: '40px',
                        border: '1px solid lightgrey',
                        borderRadius: '5px',
                        display: 'flex',
                        justifyContent: "start",
                        alignItems: 'start',
                        gap: '5px',
                    }}
                >
                    <Box
                        sx={{
                        width: '85%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'start',
                        alignItems: 'center',
                        gap: '5px',
                        paddingRight: '25px',
                        }}
                    >
                        <Button
                            sx={{...orderStyle, width: '25%'}}
                            onClick={() => handleChangeTrainingOrder("Title")}
                        >
                            <Typography>
                                {t("title")}
                            </Typography>
                            {selectedTrainingOrder === "Title" ? (trainingOrderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                        <Button
                        sx={{...orderStyle, width: '25%'}}
                        onClick={() => handleChangeOrder("Date")}
                        >
                            <Typography>
                                {t("date")}
                            </Typography>
                            {selectedOrder === "Date" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                        <Button
                            sx={{...orderStyle, width: '25%'}}
                            onClick={() => handleChangeOrder("Location")}
                        >
                            <Typography>
                                {t("location")}
                            </Typography>
                            {selectedOrder === "Location" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                        <Button
                            sx={{...orderStyle, width: '25%'}}
                            onClick={() => handleChangeOrder("Trainer")}
                        >
                            <Typography>
                                {t("trainer")}
                            </Typography>
                            {selectedOrder === "Trainer" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                        <Button
                            sx={{...orderStyle, width: '25%'}}
                            onClick={() => handleChangeOrder("Mode")}
                        >
                            <Typography>
                                {t("mode")}
                            </Typography>
                            {selectedOrder === "Mode" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                        <Button
                            sx={{...orderStyle, width: '25%'}}
                        >
                            <Typography>
                                {t("remaining_places")}
                            </Typography>
                        </Button>
                        <Button
                            sx={{...orderStyle, width: '25%'}}
                        >
                            <Typography>
                                {t("deadline")}
                            </Typography>
                        </Button>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    width: '100%',
                    height: "auto",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                }}
            >
                {displayedTrainings
                .map(training => (
                    <Box
                        key={training._id}
                        sx={{
                            width: '100%',
                            height: 'auto',
                            display: 'flex',
                            flexDirection: "row",
                            justifyContent: "start",
                            alignItems: 'center',
                            boxSizing: 'border-box',
                            backgroundColor: "background.paper",
                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                            borderRadius: "10px",
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            cursor: "pointer",
                            gap: "5px",  
                            transition: "background-color 0.2s ease-in-out",
                            "&:hover": {
                                backgroundColor: "background.navbar",
                            },
                        }}
                    >
                        <Box
                            sx={{
                                width: '85%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'start',
                                alignItems: 'center',
                                gap: '5px',
                                paddingRight: '25px',
                                }}
                        >
                            <TextField
                                variant="outlined"
                                required
                                placeholder={t("title")}
                                size="small"
                                value={training.title}
                                sx={{
                                    width: "25%",
                                    textAlign: "center",
                                    "& .MuiOutlinedInput-root": {
                                        textAlign: "center",
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        textAlign: "center",
                                        cursor: "pointer",  
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                }}
                            />
                            <TextField
                                variant="outlined"
                                required
                                placeholder={t("date")}
                                size="small"
                                value={formatDaysWithMonth(training.date, t(training.month))}
                                sx={{
                                    width: "25%",
                                    textAlign: "center",
                                    "& .MuiOutlinedInput-root": {
                                        textAlign: "center",
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        textAlign: "center",
                                        cursor: "pointer",   
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                }}
                            />
                            <TextField
                                variant="outlined"
                                required
                                placeholder={t("location")}
                                size="small"
                                value={training.location}
                                sx={{
                                    width: "25%",
                                    textAlign: "center",
                                    "& .MuiOutlinedInput-root": {
                                        textAlign: "center",
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        textAlign: "center",
                                        cursor: "pointer", 
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                }}
                            />
                            <TextField
                                variant="outlined"
                                required
                                placeholder={t("trainer")}
                                size="small"
                                value={TrainingTrainers.find(trainer => trainer.id === training.trainer)?.name || ""}
                                sx={{
                                    width: "25%",
                                    textAlign: "center",
                                    "& .MuiOutlinedInput-root": {
                                        textAlign: "center",
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        textAlign: "center", 
                                        cursor: "pointer", 
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                }}
                            />
                            <TextField
                                variant="outlined"
                                required
                                placeholder={t("mode")}
                                size="small"
                                value={t(training.mode)}
                                sx={{
                                    width: "25%",
                                    textAlign: "center",
                                    "& .MuiOutlinedInput-root": {
                                        textAlign: "center",
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        textAlign: "center",
                                        cursor: "pointer",   
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                }}
                            />
                            <TextField
                                variant="outlined"
                                required
                                placeholder={t("remaining_places")}
                                size="small"
                                value={training.nbOfParticipants - training.nbOfConfirmedRequests || training.nbOfParticipants}
                                sx={{
                                    width: "25%",
                                    textAlign: "center",
                                    "& .MuiOutlinedInput-root": {
                                        textAlign: "center",
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        textAlign: "center",
                                        cursor: "pointer",   
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                }}
                            />
                            <TextField
                                variant="outlined"
                                required
                                placeholder={t("remaining_places")}
                                size="small"
                                value={dayjs(training.registrationDeadline).format("YYYY-MM-DD HH:mm")|| t("registrationDeadline")}
                                sx={{
                                    width: "25%",
                                    textAlign: "center",
                                    "& .MuiOutlinedInput-root": {
                                        textAlign: "center",
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        textAlign: "center",
                                        cursor: "pointer",
                                        color: dayjs(training.registrationDeadline).diff(dayjs(), 'day') <= 1 ? "#EA9696" : "black",   
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                }}
                            />
                        </Box> 
                        <Box 
                            sx={{width:'15%',paddingRight: "20px", display:"flex", flexDirection:"row", justifyContent:"end", alignItems: "center",}}
                            >
                            <Box
                                sx={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: TrainingStatusColors[training.status] ,
                                marginRight: "30px",
                                }}
                            />
                            <Tooltip title={t("view_details")} arrow> 
                                <IconButton sx={{color:"#76C5E1"}}  onClick={() => {showTrainingDetails(training._id);
                                }}>
                                    <RemoveRedEyeIcon/>
                                </IconButton>
                            </Tooltip>
                            {training.status === "approved"?
                            <Badge badgeContent={requestResponseTrainings?.includes(training._id) ? 1 : 0} color="primary"
                            sx={{ 
                                "& .MuiBadge-badge": { 
                                fontSize: "10px", 
                                height: "16px", 
                                minWidth: "16px", 
                                padding: "2px",
                                position: "absolute",
                                right: "10px",
                                } 
                            }}
                            >
                            <Tooltip 
                            title={
                                dayjs(training.registrationDeadline).diff(dayjs(), 'day') <= 2
                                ? t("confirm,_you_run_out_of_time!")
                                : t("confirm_attendance")
                            } 
                            arrow
                            > 
                            <IconButton 
                                sx={{ color: dayjs(training.registrationDeadline).diff(dayjs(), 'day') <= 1 ? "#EA9696" :  "#76C5E1"}}  
                                onClick={() => {
                                showVerifyAttendanceDialog(training._id);
                                handleOpenRequestsResponsesNotification();
                                }}
                            >
                                <DoneIcon />
                            </IconButton>
                            </Tooltip>
                            </Badge>:null
                            }
                            {training.status === "confirmed"?
                            <Badge badgeContent={numberOfQuizFromTrainer ? 1 : 0} color="primary"
                            sx={{ 
                                "& .MuiBadge-badge": { 
                                fontSize: "10px", 
                                height: "16px", 
                                minWidth: "16px", 
                                padding: "2px",
                                position: "absolute",
                                right: "10px",
                                } 
                            }}
                            >
                            <Tooltip title={t("add_quiz")} arrow> 
                                <IconButton 
                                disabled={
                                    !training.quiz
                                }
                                sx={{color:"#76C5E1"}} onClick={() => showAddQuiz(training._id)}>
                                    <AddIcon/>
                                </IconButton>
                            </Tooltip>
                            </Badge>:null}
                            {training.status === "confirmed"?
                            <Badge badgeContent={(trainingsHaveFeedbackReq.includes(training._id) && numberOfNewFeedbacksReq) ? 1 : 0} color="primary"
                            sx={{ 
                                "& .MuiBadge-badge": { 
                                fontSize: "10px", 
                                height: "16px", 
                                minWidth: "16px", 
                                padding: "2px",
                                position: "absolute",
                                right: "10px",
                                } 
                            }}
                            >
                            <Tooltip title={t("feedback")} arrow> 
                                <IconButton sx={{color:"#76C5E1"}} 
                                disabled={
                                    !canAddColdFeedback?.includes(training._id) && 
                                    !canAddHotFeedback?.includes(training._id) 
                                }  onClick={() => {
                                    showFeedbackDialog(training._id);
                                    handleOpenColdFeedbackReqNotification();
                                }}>
                                    <FeedIcon/>
                                </IconButton>
                            </Tooltip>
                            </Badge>:null}
                        </Box>
                    </Box>
                ))}
            </Box>
            <Dialog
                open={verifyAttendance}
                disableScrollLock={true}
                onClose={hideVerifyAttendanceDialog}
                PaperProps={{
                    sx: {
                        width: "auto",  
                        height: "auto", 
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "",
                        alignItems: "center",
                        borderRadius: "10px",
                        padding: '20px',
                    }
                }}
            >
                <DialogTitle>{t("confirm_attendance")}?</DialogTitle>
                <Box 
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                >
                    <Button sx={{
                        color: 'white',
                        backgroundColor: '#EA9696',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        width: '100px',
                        height: '40px',
                        marginTop: '10px',
                        textTransform: "none",
                        '&:hover': {
                            backgroundColor: '#EAB8B8',
                            color: 'white',
                        },
                    }} 
                    onClick={hideVerifyAttendanceDialog}>
                        {t("no")}
                    </Button>
                    <Button sx={{
                        color: 'white',
                        backgroundColor: '#2CA8D5',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        width: '100px',
                        height: '40px',
                        marginTop: '10px',
                        textTransform: "none",
                        '&:hover': {
                            backgroundColor: '#76C5E1',
                            color: 'white',
                        },
                    }} 
                    onClick={handleAttendanceVerification}
                    >
                        {t("yes")}
                    </Button>
                </Box>
            </Dialog>
            <Dialog
                open={showTraining}
                onClose={hideTrainingDetails}
                disableScrollLock={true}
                PaperProps={{
                    sx: {
                        width: "800px",  
                        height: "auto", 
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "start",
                        alignItems: "center",
                        borderRadius: "10px",
                        gap: "20px",
                        padding: "20px",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {
                            display: "none"  
                        }
                    }
                }}
            >
                <DialogTitle>{t("training_details")}</DialogTitle>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        pointerEvents: "none", 
                        userSelect: "text",    
                        cursor: "default",
                        gap: "20px",
                    }}
                >
                    <TextField
                        label={t("title")}
                        value={t(getTrainingById(selectedTrainingId)?.title)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("month")}
                        value={t(getTrainingById(selectedTrainingId)?.month)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        pointerEvents: "none", 
                        userSelect: "text",    
                        cursor: "default",
                        gap: "20px",
                    }}
                >
                    <TextField
                        label={t("skill")}
                        value={t(getTrainingById(selectedTrainingId)?.skillType)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("date")}
                        value={t(getTrainingById(selectedTrainingId)?.date)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        pointerEvents: "none", 
                        userSelect: "text",    
                        cursor: "default",
                        gap: "20px",
                    }}
                >
                    <TextField
                        label={t("nbOfHours")}
                        value={t(getTrainingById(selectedTrainingId)?.nbOfHours)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("location")}
                        value={t(getTrainingById(selectedTrainingId)?.location)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        pointerEvents: "none", 
                        userSelect: "text",    
                        cursor: "default",
                        gap: "20px",
                    }}
                >
                    <TextField
                        label={t("mode")}
                        value={t(getTrainingById(selectedTrainingId)?.mode)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("type")}
                        value={t(getTrainingById(selectedTrainingId)?.type)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        width: '100%',
                        pointerEvents: "none", 
                        userSelect: "text",    
                        cursor: "default",
                        gap: '20px',
                    }}
                >   
                    <TextField
                        label={t("nbOfSessions")}
                        value={t(getTrainingById(selectedTrainingId)?.nbOfSessions)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("trainer")}
                        value={TrainingTrainers.find(trainer => trainer.id === getTrainingById(selectedTrainingId)?.trainer)?.name || ""}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        pointerEvents: "none", 
                        userSelect: "text",    
                        cursor: "default",
                        gap: "20px",
                    }}
                >
                    <TextField
                        label={t("nbOfParticipants")}
                        value={t(getTrainingById(selectedTrainingId)?.nbOfParticipants)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("description")}
                        value={t(getTrainingById(selectedTrainingId)?.description)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box 
                    sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    pointerEvents: "none", 
                    userSelect: "text",    
                    cursor: "default",
                    width: '100%',
                    gap: '10px',
                    flexWrap: "wrap",
                    
                }}
                >
                    {Array.from({ length: getTrainingById(selectedTrainingId)?.nbOfSessions }, (_, index) => (
                        <Box 
                            key={index} 
                            sx={{ 
                            width: "100%", 
                            height: "auto",
                            borderRadius: '10px',
                            backgroundColor: 'background.noBigDiff',
                            padding: '10px',
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "start",
                            gap: '10px',
                            }}
                        >
                            {t("session")} {index + 1}
                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "20px",
                                }}
                            >
                                <TextField
                                    label={t("name")}
                                    value={getTrainingById(selectedTrainingId)?.sessions[index]?.name}
                                    sx={{ 
                                        width: "50%",
                                        cursor: "pointer", 
                                        "& .MuiInputBase-input": { cursor: "pointer" }, 
                                        "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                                    }}
                                    InputProps={{
                                        readOnly: true, 
                                    }}
                                />
                                <TextField
                                    label={t("date")}
                                    value={getTrainingById(selectedTrainingId)?.sessions[index]?.date}
                                    sx={{ 
                                        width: "50%",
                                        cursor: "pointer", 
                                        "& .MuiInputBase-input": { cursor: "pointer" }, 
                                        "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                                    }}
                                    InputProps={{
                                        readOnly: true, 
                                    }}
                                />
                            </Box>
                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "20px",
                                }}
                            >
                                <TextField
                                    label={t("duration")}
                                    value={getTrainingById(selectedTrainingId)?.sessions[index]?.duration}
                                    sx={{ 
                                        width: "50%",
                                        cursor: "pointer", 
                                        "& .MuiInputBase-input": { cursor: "pointer" }, 
                                        "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                                    }}
                                    InputProps={{
                                        readOnly: true, 
                                    }}
                                />
                                <TextField
                                    label={t("location")}
                                    value={getTrainingById(selectedTrainingId)?.sessions[index]?.location}
                                    sx={{ 
                                        width: "50%",
                                        cursor: "pointer", 
                                        "& .MuiInputBase-input": { cursor: "pointer" }, 
                                        "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                                    }}
                                    InputProps={{
                                        readOnly: true, 
                                    }}
                                />
                            </Box>
                        </Box>
                    ))}
                </Box>
                <Box 
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                >
                <Button sx={{
                    color: 'white',
                    backgroundColor: '#EA9696',
                    padding: '5px 10px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    width: '100px',
                    height: '40px',
                    marginTop: '10px',
                    textTransform: "none",
                    '&:hover': {
                        backgroundColor: '#EAB8B8',
                        color: 'white',
                    },
                }} 
                onClick={hideTrainingDetails}>
                    {t("close")}
                </Button>
                </Box> 
            </Dialog>
            <Dialog
                open={showFeedback}
                disableScrollLock={true}
                onClose={hideFeedbackDialog}
                PaperProps={{
                    sx: {
                        minWidth: "50%",  
                        height: "auto", 
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "",
                        alignItems: "center",
                        borderRadius: "10px",
                        padding: '20px',
                    }
                }}
            >
                <DialogTitle>{feedbackType === "cold_feedback" ? t("cold_feedback") : t("hot_feedback")}</DialogTitle>
                <Box 
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: "10px",
                        gap: '20px',
                    }}
                >
                    <Button sx={{
                        color: 'white',
                        backgroundColor: '#2CA8D5',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        width: 'auto',
                        height: '40px',
                        marginTop: '10px',
                        textTransform: "none",
                        '&:hover': {
                            backgroundColor: '#76C5E1',
                            color: 'white',
                        },
                    }} 
                    disabled={!canAddColdFeedback?.includes(selectedTrainingId)}
                    onClick={() => setFeedbackType("cold_feedback")}>
                        {t("cold_feedback")}
                    </Button>
                    <Badge badgeContent={(canAddHotFeedback?.includes(selectedTrainingId) && numberOfNewFeedbacksReq) ? 1 : 0} color="primary"
                            sx={{ 
                                "& .MuiBadge-badge": { 
                                fontSize: "10px", 
                                height: "16px", 
                                minWidth: "16px", 
                                padding: "2px",
                                position: "absolute",
                                right: "10px",
                                } 
                            }}
                            >
                        <Button sx={{
                            color: 'white',
                            backgroundColor: '#EA9696',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            width: 'auto',
                            height: '40px',
                            marginTop: '10px',
                            textTransform: "none",
                            '&:hover': {
                                backgroundColor: '#EAB8B8',
                                color: 'white',
                            },
                        }} 
                        disabled={!canAddHotFeedback?.includes(selectedTrainingId)}
                        onClick={() => {
                            setFeedbackType("hot_feedback");
                            handleOpenHotFeedbackReqNotification();
                        }}
                        >
                            {t("hot_feedback")}
                        </Button>
                    </Badge>
                </Box>
                {feedbackType==="cold_feedback" && canAddColdFeedback?.includes(selectedTrainingId)? 
                <Box
                    sx={{
                        width:"100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap:"15px"
                    }}
                >
                    <Typography
                    
                    >
                        {t("training")}
                    </Typography>
                    <TextField
                        required
                        label={t("theme")}
                        value={coldFeedback.theme}
                        onChange={(e) => handleColdFeedbackChange("theme", e.target.value)}
                        multiline
                        sx={{ 
                            width: "100%",
                        }}
                    />
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: '10px',
                        }}
                    >
                        <TextField
                            label={t("association")}
                            value={coldFeedback.association}
                            onChange={(e) => handleColdFeedbackChange("association", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                        />
                        <TextField
                            label={t("trainer")}
                            value={coldFeedback.trainer}
                            onChange={(e) => handleColdFeedbackChange("trainer", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                        />
                    </Box>
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: '10px',
                        }}
                    >
                        <TextField
                            required
                            label={t("date")}
                            value={coldFeedback.trainingDate}
                            onChange={(e) => handleColdFeedbackChange("trainingDate", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                        />
                        <TextField
                            required
                            label={t("location")}
                            value={coldFeedback.location}
                            onChange={(e) => handleColdFeedbackChange("location", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                    />
                    </Box>
                    <Typography
                    
                    >
                        {t("participant")}
                    </Typography>
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: '10px',
                        }}
                    >
                        <TextField
                            required
                            label={t("name")}
                            value={coldFeedback.name}
                            onChange={(e) => handleColdFeedbackChange("name", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                        />
                        <TextField
                            required
                            label={t("registration_number")}
                            value={coldFeedback.matricule}
                            onChange={(e) => handleColdFeedbackChange("matricule", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                        />
                    </Box>
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: '10px',
                        }}
                    >
                        <TextField
                            required
                            label={t("function")}
                            value={coldFeedback.function}
                            onChange={(e) => handleColdFeedbackChange("function", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                        />
                        <TextField
                            required
                            label={t("service")}
                            value={coldFeedback.service}
                            onChange={(e) => handleColdFeedbackChange("service", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                        />
                    </Box>
                    <Typography
                    
                    >
                        {t("quiz")} {t("participant")}
                    </Typography>
                    <FormSubmit 
                        formFields={formFields} 
                        onFieldValuesChange={setFieldValues} 
                    />
                    {/* 
                    <Typography
                        sx={{   
                            width: "100%",
                            textAlign: "start",
                        }}
                        >
                        {t("appliedKnowledge")}
                    </Typography>
                    <Box sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        height: '100%',
                        gap: '10px',
                    }}>
                        <FormControlLabel 
                            control={<Checkbox checked={coldFeedback.appliedKnowledge} 
                            onChange={(e) => handleColdFeedbackChange("appliedKnowledge", e.target.checked)} />} 
                            label={t("yes")}
                        />
                        <FormControlLabel 
                            control={<Checkbox checked={!coldFeedback.appliedKnowledge} 
                            onChange={(e) => handleColdFeedbackChange("appliedKnowledge", !e.target.checked)} />} 
                            label={t("no")}
                        />
                    </Box>
                    {coldFeedback.appliedKnowledge && (
                        <TextField
                            label={t("knowledge")}
                            value={coldFeedback.knowledge}
                            onChange={(e) => handleColdFeedbackChange("knowledge", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                        />
                    )}
                    {!coldFeedback.appliedKnowledge && (
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            gap: '10px',
                        }}
                    >
                        <Typography
                            sx={{   
                                width: "20%",
                                textAlign: "start",
                            }}
                            required
                            >
                            {t("why")} ?
                        </Typography>
                        <Box sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            height: '100%',
                            gap: '10px',
                        }}>
                            <FormControlLabel 
                                control={<Checkbox checked={coldFeedback.whyNotApplied === t("lackOfTime")} 
                                onChange={(e) => handleColdFeedbackChange("whyNotApplied", t("lackOfTime"))} />} 
                                label={t("lackOfTime")}
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={coldFeedback.whyNotApplied === t("modulesNotAcquired")} 
                                onChange={(e) => handleColdFeedbackChange("whyNotApplied", t("modulesNotAcquired"))} />} 
                                label={t("modulesNotAcquired")}
                            />
                        </Box>
                        <Box sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            height: '100%',
                            gap: '10px',
                        }}>
                            <FormControlLabel 
                                control={<Checkbox checked={coldFeedback.whyNotApplied === t("trainingNotSuitable")} 
                                onChange={(e) => handleColdFeedbackChange("whyNotApplied", t("trainingNotSuitable"))} />} 
                                label={t("trainingNotSuitable")}
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={coldFeedback.whyNotApplied === t("lackOfResources")} 
                                onChange={(e) => handleColdFeedbackChange("whyNotApplied", t("lackOfResources"))} />} 
                                label={t("lackOfResources")}
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={coldFeedback.whyNotApplied === t("other")} 
                                onChange={(e) => handleColdFeedbackChange("whyNotApplied", t("other"))} />} 
                                label={t("other")}
                            />
                        </Box>
                        {coldFeedback.whyNotApplied === t("other") && (
                            <TextField
                                label={t("other")}
                                required
                                value={coldFeedback.otherWhyNotApplied}
                                onChange={(e) => handleColdFeedbackChange("otherWhyNotApplied", e.target.value)}
                                multiline
                                sx={{ 
                                    width: "100%",
                                }}
                            />
                        )}
                    </Box>)
                    }
                    <Typography
                        sx={{   
                            width: "100%",
                            textAlign: "start",
                        }}
                    >
                    {t("improvedWorkEfficiency")}
                    </Typography>
                    <Box sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        height: '100%',
                        gap: '10px',
                    }}>
                        <FormControlLabel 
                            control={<Checkbox checked={coldFeedback.improvedWorkEfficiency} 
                            onChange={(e) => handleColdFeedbackChange("improvedWorkEfficiency", e.target.checked)} />} 
                            label={t("yes")}
                        />
                        <FormControlLabel 
                            control={<Checkbox checked={!coldFeedback.improvedWorkEfficiency} 
                            onChange={(e) => handleColdFeedbackChange("improvedWorkEfficiency", !e.target.checked)} />} 
                            label={t("no")}
                        />
                    </Box>
                    {coldFeedback.improvedWorkEfficiency && (
                        <Box
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                gap: '10px',
                            }}
                        >
                            <Typography
                                sx={{   
                                    width: "100%",
                                    textAlign: "start",
                                }}
                            >
                            {t("how")} ?
                            </Typography>
                            <TextField
                                value={coldFeedback.improvment}
                                onChange={(e) => handleColdFeedbackChange("improvment", e.target.value)}
                                multiline
                                sx={{ 
                                    width: "100%",
                                }}
                            />
                        </Box>
                    )}
                    {!coldFeedback.improvedWorkEfficiency && (
                        <Box
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                gap: '10px',
                            }}
                        >
                            <Typography
                                sx={{   
                                    width: "100%",
                                    textAlign: "start",
                                }}
                            >
                            {t("why")} ?
                            </Typography>
                            <TextField
                                value={coldFeedback.whyNotImproved}
                                onChange={(e) => handleColdFeedbackChange("whyNotImproved", e.target.value)}
                                multiline
                                sx={{ 
                                    width: "100%",
                                }}
                            />
                        </Box>
                    )}
                    <Typography
                        sx={{   
                            width: "100%",
                            textAlign: "start",
                        }}
                    >
                    {t("trainingImprovementsSuggested")}
                    </Typography>
                    <TextField
                        value={coldFeedback.trainingImprovementsSuggested}
                        onChange={(e) => handleColdFeedbackChange("trainingImprovementsSuggested", e.target.value)}
                        multiline
                        sx={{ 
                            width: "100%",
                        }}
                    />
                    <TextField
                        label={t("comments")}
                        value={coldFeedback.comments}
                        onChange={(e) => handleColdFeedbackChange("comments", e.target.value)}
                        multiline
                        sx={{ 
                            width: "100%",
                        }}
                    /> */}
                </Box>
                : feedbackType==="hot_feedback" && canAddHotFeedback?.includes(selectedTrainingId)? 
                <Box
                    sx={{
                        width:"100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap:"15px"
                    }}
                >
                    <Typography
                    
                    >
                        {t("training")}
                    </Typography>
                    <TextField
                        required
                        label={t("theme")}
                        value={hotFeedback.theme}
                        onChange={(e) => handleHotFeedbackChange("theme", e.target.value)}
                        multiline
                        sx={{ 
                            width: "100%",
                        }}
                    />
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: '10px',
                        }}
                    >
                        <TextField
                            label={t("association")}
                            value={hotFeedback.association}
                            onChange={(e) => handleHotFeedbackChange("association", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                        />
                        <TextField
                            label={t("trainer")}
                            value={hotFeedback.trainer}
                            onChange={(e) => handleHotFeedbackChange("trainer", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                        />
                    </Box>
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: '10px',
                        }}
                    >
                        <TextField
                            required
                            label={t("date")}
                            value={hotFeedback.trainingDate}
                            onChange={(e) => handleHotFeedbackChange("trainingDate", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                        />
                        <TextField
                            required
                            label={t("location")}
                            value={hotFeedback.location}
                            onChange={(e) => handleHotFeedbackChange("location", e.target.value)}
                            multiline
                            sx={{ 
                                width: "100%",
                            }}
                    />
                    </Box>
                    <Typography
                    
                    >
                        {t("quiz")}
                    </Typography>
                    <FormSubmit 
                        formFields={formFields} 
                        onFieldValuesChange={setFieldValues} 
                    />
                    {/* <Typography
                        sx={{   
                            width: "100%",
                            textAlign: "start",
                            marginBottom: "20px",
                            fontWeight: "bold",
                        }}
                        >
                        - {t("checkQuestion")} :
                    </Typography>
                    {[
                        { label: t("objectivesCommunication"), field: "objectivesCommunication" },
                        { label: t("trainingOrganization"), field: "trainingOrganization" },
                        { label: t("groupComposition"), field: "groupComposition" },
                        { label: t("materialAdequacy"), field: "materialAdequacy" },
                        { label: t("programCompliance"), field: "programCompliance" },
                        { label: t("contentClarity"), field: "contentClarity" },
                        { label: t("materialQuality"), field: "materialQuality" },
                        { label: t("trainingAnimation"), field: "trainingAnimation" },
                        { label: t("trainingProgress"), field: "trainingProgress" },
                        { label: t("metExpectations"), field: "metExpectations" },
                        { label: t("objectivesAchieved"), field: "objectivesAchieved" },
                        { label: t("exercisesRelevance"), field: "exercisesRelevance" },
                        { label: t("willApplySkills"), field: "willApplySkills" }
                    ].map((question, index) => (
                        <Box key={index} 
                        sx={{ 
                            width: '100%', 
                            display: 'flex', 
                            flexDirection: 'row',
                            justifyContent: 'start',
                            alignItems: 'center',
                            gap: "40px" }}
                        >
                            <Typography>{question.label}</Typography>
                            <Rating
                                name={question.field}
                                value={hotFeedback[question.field]}
                                onChange={(event, newValue) => handleHotFeedbackChange(question.field, newValue)}
                            />
                        </Box>
                    ))}
                    <TextField
                        label={t("comments")}
                        value={hotFeedback.comments}
                        onChange={(e) => handleHotFeedbackChange("comments", e.target.value)}
                        multiline
                        sx={{ 
                            width: "100%",
                        }}
                    /> */}
                </Box>
                :null}
                <Box 
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                        marginTop: "10px",
                    }}
                >
                    <Button sx={{
                        color: 'white',
                        backgroundColor: '#EA9696',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        width: '100px',
                        height: '40px',
                        marginTop: '10px',
                        textTransform: "none",
                        '&:hover': {
                            backgroundColor: '#EAB8B8',
                            color: 'white',
                        },
                    }} 
                    onClick={hideFeedbackDialog}>
                        {t("cancel")}
                    </Button>
                    <Button sx={{
                        color: 'white',
                        backgroundColor: '#2CA8D5',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        width: '100px',
                        height: '40px',
                        marginTop: '10px',
                        textTransform: "none",
                        '&:hover': {
                            backgroundColor: '#76C5E1',
                            color: 'white',
                        },
                    }} 
                    onClick={handleFeedbackSubmission}
                    >
                        {t("send")}
                    </Button>
                </Box>
            </Dialog>
            <Dialog
                open={addQuiz}
                disableScrollLock={true}
                onClose={hideAddQuiz}
                PaperProps={{
                    sx: {
                        width: "auto",  
                        height: "auto", 
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "",
                        alignItems: "center",
                        borderRadius: "10px",
                        padding: '20px',
                    }
                }}
            >
                <DialogTitle>{t("add_quiz")}</DialogTitle>
                <Button
                    variant="contained"
                    component="label"
                    sx={{
                    color: 'white',
                    backgroundColor: '#2CA8D5',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    width: 'auto',
                    height: '40px',
                    marginTop: '10px',
                    textTransform: 'none',
                    '&:hover': {
                        backgroundColor: '#76C5E1',
                        color: 'white',
                    },
                    }}
                    onClick={() => downloadQuizFile()}
                >
                    {t('download_quiz')} 
                </Button>
                <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ gap :"10px", width:"100%"}}>
                        <Button
                            variant="contained"
                            component="label"
                            sx={{
                            color: 'white',
                            backgroundColor: '#2CA8D5',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            width: 'auto',
                            height: '40px',
                            marginTop: '10px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#76C5E1',
                                color: 'white',
                            },
                            }}
                        >
                            {t('choose_file')} 
                            <input
                            type="file"
                            hidden
                            onChange={handleFileChange}
                            />
                        </Button>
                    </Grid>
                    <Grid item xs={12}>  
                    <TextField
                        fullWidth
                        value={file ? file.name : ''}
                        label="Selected File"
                        variant="outlined"
                        disabled
                    />
                    </Grid>
                    <Grid item xs={12}>
                    <Box 
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                    >
                        <Button sx={{
                            color: 'white',
                            backgroundColor: '#2CA8D5',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            width: 'auto',
                            height: '40px',
                            marginTop: '10px',
                            textTransform: "none",
                            '&:hover': {
                                backgroundColor: '#76C5E1',
                                color: 'white',
                            },
                        }} 
                        onClick={handleUpload}>
                            {t("upload_quiz_file")}
                        </Button>
                    </Box>
                    </Grid>
                </Grid>
            </Dialog>
            <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
            />
            <Snackbar open={showsVerificationAlert} autoHideDuration={3000} onClose={handleVerificationAlertClose}>
                <Alert onClose={handleVerificationAlertClose} severity={verifyAlert} variant="filled">
                    {t(verifyAlertMessage)}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TraineeTrainings;