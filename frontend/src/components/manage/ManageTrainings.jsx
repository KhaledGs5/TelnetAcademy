import React, { useState, useEffect } from "react";
import { useLanguage } from "../../languagecontext";
import { Box, TextField , Typography, Button,Input,IconButton, InputAdornment, Tooltip, OutlinedInput, FormControl, InputLabel, Pagination,Radio, Alert, Snackbar , Autocomplete, Popover, Rating, Badge, Select, Checkbox} from "@mui/material";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import { useUser } from '../../UserContext';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import FeedIcon from '@mui/icons-material/Feed';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { useNavbar } from '../../NavbarContext';
import { StaticDatePicker, LocalizationProvider , DateTimePicker} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import FormPreview from '../FormPreview';
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from 'dayjs';
import api from "../../api";
import * as XLSX from 'xlsx';


const ManageTrainings = () => {

    const { t } = useLanguage();
    const [selectedTrainingId, setSelectedTrainingId] = useState(true);
    const { user } = useUser();

    // Verify Update Or Create Training...........

    const [showsVerificationAlert, setShowsVerifificationAlert] = useState(false);
    const [verifyAlertMessage, setVerifyAlertMessage] = useState("");
    const [verifyAlert, setVerifyAlert] = useState("error");
    const handleVerificationAlertClose = () => {
        setShowsVerifificationAlert(false);
    };
    

    // Fetch All Tranings with corresponding sessions
    const [trainings, setTrainings] = useState([]);

    const updateStatus = () => {
    trainings.forEach((training) => {
        training.sessions.forEach((session) => {
            api.put(`/api/sessions/${session._id}`, session)
                .then((response) => {})
                .catch((error) => {});
        });
        });
    };

    useEffect(() => {
    updateStatus();
    }, []);

    const fetchTrainings = () => {
        api.get("/api/trainings")
            .then((response) => {
                const trainingsWithModified = response.data.map(training => ({
                    ...training,
                    selected: false,
                    sessions: [],
                    full: training.nbOfConfirmedRequests == training.nbOfParticipants,
                    numberOfConfirmed : training.nbOfConfirmedRequests || 0,
                    numberOfNotConfirmed : ((training.nbOfAcceptedRequests || 0) - (training.nbOfConfirmedRequests || 0) || 0),
                }));
                setTrainings(trainingsWithModified);
    
                let fullTrainings = 0;
                let notFullTrainings = 0;
                trainingsWithModified.forEach((training) => {
                    if(training.full){
                        fullTrainings++;
                    }else{
                        notFullTrainings++;
                    }
                    setNumberOfFullTrainings(fullTrainings);
                    setNumberOfNotFullTrainings(notFullTrainings);
                    setNewTrainingRegisDeadline(dayjs(training.registrationDeadline));
                    api.get(`/api/sessions/training/${training._id}`)
                        .then((response) => {
                            const updatedSessions = response.data.map(session => ({
                                ...session,
                                otherSessionLocation: false, 
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
    
                trainingsWithModified.forEach((training) => {
                    let listOfTrainees = [];
                    (training.acceptedtrainees).forEach((traineeId) => { 
                        api.get(`/api/users/${traineeId}`)
                           .then((response) => {
                                const res = response.data;
                                const trainee = {
                                    ...res,
                                    status: training.confirmedtrainees.includes(traineeId) 
                                    ? "confirmed"
                                    : "not_confirmed"
                                }
                                listOfTrainees.push(trainee);
                            })
                           .catch((error) => {
                                console.error("Error fetching trainee:", error);
                            });
                    })
                    
                    setTrainings((prevTrainings) =>
                        prevTrainings.map((t) =>
                            t._id === training._id? {...t, trainees: listOfTrainees } : t
                        )
                    );
                })
            })
            .catch((error) => {
                console.error("Error fetching trainings:", error);
            });
    };
    
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

    const [numberOfFullTrainings, setNumberOfFullTrainings] = useState(0);
    const [numberOfNotFullTrainings, setNumberOfNotFullTrainings] = useState(0);


    //Edit Attendance List By Id ...........

    const [showAttendeeList, setShowAttendeeList] = useState(false);
    const [traineesSetColdFeedbacks, setTraineeSetColdFeedback] = useState([]);
    const [traineesSetHotFeedbacks, setTraineeSetHotFeedback] = useState([]);

    const fetchTraineesFeedbacks = (trainingId) => {
        api
          .post(`/api/trainings/feedbacks/${trainingId}`)
          .then((response) => {
            const { coldFeedback, hotFeedback } = response.data;
            const traineesCold = [
              ...coldFeedback.map(fb => fb.trainee),
            ];
            const traineesHot = [
                ...hotFeedback.map(fb => fb.trainee),
              ];
      
            const uniqueHotTrainees = [...new Set(traineesHot.map(id => id.toString()))];
    
            setTraineeSetHotFeedback(uniqueHotTrainees);
            const uniqueColdTrainees = [...new Set(traineesCold.map(id => id.toString()))];
      
            setTraineeSetColdFeedback(uniqueColdTrainees);
          })
          .catch((error) => {
            console.error("Error fetching feedbacks:", error);
          });
      };
      
      

    const showAttendeeListDialog = (trainingId) => {
        setFeedbackType("cold_feedback");
        setSelectedTrainingId(trainingId);
        fetchTraineesFeedbacks(trainingId);
        setShowAttendeeList(true);
    };

    const hideAttendeeListDialog = () => {
        setShowAttendeeList(false);
    };

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [traineeMail, setTraineeMail] = useState("");
    const [traineeName, setTraineeName] = useState("");
    const [selectedTraineeId, setSelectedTraineeId] = useState("");

    const showConfirmDeleteDialog = (mail, name, id) => {
        setTraineeMail(mail);
        setTraineeName(name);
        setShowConfirmDelete(true);
        setSelectedTraineeId(id)
    };

    const hideConfirmDeleteDialog = () => {
        setShowConfirmDelete(false);
    };

    const handleUpdateAttendanceList = async () => {
        const req = {trainee : selectedTraineeId, managerdeleted: user._id};
        await api.put(`/api/trainings/delete/${selectedTrainingId}`, req)
        .then(() => {
            fetchTrainings();
            showAttendeeListDialog(selectedTrainingId);
            setShowConfirmDelete(false);
        })
        .catch((error) => {
            console.error("Error updating attendance list:", error);
        });
        await api.post("/delete_from_training", 
            {
                toEmail: traineeMail,
                message: `Hello ${traineeName}, you have been deleted from the training`,
                url: "http://10.3.1.103:49880/enrolledtrainee",
            })
    };

    const [newTrainingRegisDeadline, setNewTrainingRegisDeadline] = useState(dayjs());
    const [confirmChangeDeadline, setConfirmChangeDeadline] = useState(false);

    const showConfirmChangeDeadlineDialog = () => {
        setConfirmChangeDeadline(true);
    };

    const hideConfirmChangeDeadlineDialog = () => {
        setConfirmChangeDeadline(false);
    };


    const handleUpdateTrainingRegisDeadline = async () => {
        const req = {registrationDeadline: newTrainingRegisDeadline};
        await api.put(`/api/trainings/${selectedTrainingId}`, req)
            .then(() => {
                fetchTrainings();
                setShowAttendeeList(false);
                hideConfirmChangeDeadlineDialog();
            })
            .catch((error) => {
                console.error("Error updating training registration deadline:", error);
            });
    }

    //Send Reminder ...............

    const [showSendReminder, setShowSendReminder] = useState(false);
    const [mail, setMail] = useState("");
    const [trainingName, setTrainingName] = useState("");
    const [traineeId, setTraineeId] = useState("");

    const showSendReminderDialog = (m,name,id) => {
        setTrainingName(name);
        setMail(m);
        setTraineeId(id);
        setShowSendReminder(true);
    }

    const hideSendReminderDialog = () => {
        setShowSendReminder(false);
    }

    const handleSendReminder = (m, name, id) => {
        api.post("/send-reminder", { 
          toEmail: m,
          message: `Reminder for Confirmation: ${name} Training`,
          url: "http://10.3.1.103:49880/enrolledtrainee",
          trainee: id,
          managerreminded: user._id,
          training: selectedTrainingId
        })
        .then((response) => {
          setVerifyAlert("success");
          setVerifyAlertMessage("reminder_sent_successfully");
          setShowsVerifificationAlert(true);
          hideSendReminderDialog();
        })
        .catch((error) => {
          console.error("Reminder send error:", error);
          setVerifyAlert("error");
          setVerifyAlertMessage("reminder_not_sent");
          setShowsVerifificationAlert(true);
        });
      }
      
    // Show Feedbacks for training .............
    const [feedbacks, setFeedbacks] = useState([]);
    const [trainingsHaveFeedbacks, setTrainingsHaveFeedbacks] = useState([]);
    const { numberOfNewFeedbacks, setNumberOfNewFeedbacks } = useNavbar();
    const [feedbackType, setFeedbackType]= useState("cold_feedback");

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
    }, [feedbackType]);

    const handleOpenFeedbackNotification = async () => {
        try {
          await api.delete("/api/notifications", { data : {rec : user._id, tp : "New_Feedback"}});
          setNumberOfNewFeedbacks(0);
        } catch (error) {
          console.error("Error marking notifications as read", error);
        }
    };

    const fetchFeedbacks = (trainingId, traineeId, type) => {
        api
          .post(`/api/trainings/feedbacks/${trainingId}`, {
            trainee: traineeId,
          })
          .then((response) => {
            setFeedbacks(response.data);
            if(type === "hot_feedback"){
                setShowHotFeedback(true);
                setFieldValues(response.data.hotFeedback[0].responses);
            }else if(type === "cold_feedback"){
                setShowColdFeedback(true);
                setFieldValues(response.data.coldFeedback[0].responses);
            }
            console.log("Fetched feedbacks:", response.data);
          })
          .catch((error) => {
            console.error("Error fetching feedbacks:", error);
          });
    };

    useEffect(() => {
        const fetchTrainingsFeedbacks = async () => {
            try {
                const newFeedbacks = await api.post("/api/notifications/withtype", {
                    rec: user._id,
                    tp: "New_Feedback"
                });
                newFeedbacks.data.notifications.forEach((notif) => {
                    setTrainingsHaveFeedbacks(prev => [...prev, notif.message]);
                });
            } catch (error) {
                console.error("Failed to fetch feedback notifications:", error);
            }
        };

        fetchTrainingsFeedbacks();
    }, []);
    
      

    const [showHotFeedbacks, setShowHotFeedbacks] = useState(false);
    const [showHotFeedback, setShowHotFeedback] = useState(false);
    const [showColdFeedback, setShowColdFeedback] = useState(false);

    const showHotFeedbacksDialog = () => {
        setFeedbackType("hot_feedback");
        setShowHotFeedbacks(true);
    };

    const hideHotFeedbacksDialog = () => {
        setFeedbackType("cold_feedback");
        setShowHotFeedbacks(false);
    };

    const showHotFeedbackDialog = (trainingId, traineeId) => {
        fetchFeedbacks(trainingId,traineeId, "hot_feedback");
        handleOpenFeedbackNotification();
    };

    const hideHotFeedbackDialog = () => {
        setShowHotFeedback(false);
    };

    const showColdFeedbackDialog = (trainingId, traineeId) => {
        fetchFeedbacks(trainingId,traineeId, "cold_feedback");
        handleOpenFeedbackNotification();
    };

    const hideColdFeedbackDialog = () => {
        setShowColdFeedback(false);
    };

    // Get Training By Id .................
    const getTrainingById = (id) => {
        return Object.values(trainings).find(training => training._id === id) || null;
    };

    // Send Feedback Request.................

    const [sendFeedbackRequest, setSendFeedbackRequest] = useState(false);
    
    const showSendFeedbackRequest = (trainingId) => {
        setSelectedTrainingId(trainingId)
        setSendFeedbackRequest(true);
    }

    const hideSendFeedbackRequest = () => {
        setSendFeedbackRequest(false);
    }

    // Confirm Cold Feedback.........

    const [confirmColdRequest, setConfirmColdRequest] = useState(false);

    const showConfirmColdRequestDialog = () => {
        setConfirmColdRequest(true);
    }

    const hideConfirmColdRequestDialog = () => {
        setConfirmColdRequest(false);
    }

    const sendColdRequest = async (trainingId) => {
        await api.post(`/api/trainings/sendcoldrequest/${trainingId}`, {manager : user._id})
            .then((response) => {
                setVerifyAlert("success");
                setVerifyAlertMessage("request_sent_successfully");
                setShowsVerifificationAlert(true);
                if(response.data) {
                    const training = getTrainingById(trainingId);
                    const listOfTrainees = training.trainees.map((trainee) => ({
                        id: trainee._id,
                        name: trainee.name,
                        email: trainee.email,
                    }));
                    
                    listOfTrainees.forEach((trainee) => {
                        api.post("/request-feedback", {
                          toEmail: trainee.email,
                          message: `Hello ${trainee.name}, can you please add feedback to Training : ${training.title}.`,
                          url: "http://10.3.1.103:49880/enrolledtrainee",
                        });
                    });    
                }
                hideConfirmColdRequestDialog();
            }).catch((error) => {
                setVerifyAlert("error");
                setVerifyAlertMessage("request_not_sent");
                setShowsVerifificationAlert(true);
            })
    }
    
    // Confirm Hot Feedback
    const [confirmHotRequest, setConfirmHotRequest] = useState(false);

    const showConfirmHotRequestDialog = () => {
        setConfirmHotRequest(true);
    }

    const hideConfirmHotRequestDialog = () => {
        setConfirmHotRequest(false);
    }
    
    const sendHotRequest = (trainingId) => {
        api.post(`/api/trainings/sendhotrequest/${trainingId}`, {manager : user._id})
            .then((response) => {
                setVerifyAlert("success");
                setVerifyAlertMessage("request_sent_successfully");
                setShowsVerifificationAlert(true);
                if(response.data) {
                    const training = getTrainingById(trainingId);
                    const listOfTrainees = training.trainees.map((trainee) => ({
                        id: trainee._id,
                        name: trainee.name,
                        email: trainee.email,
                    }));
                    
                    listOfTrainees.forEach((trainee) => {
                        api.post("/request-feedback", {
                          toEmail: trainee.email,
                          message: `Hello ${trainee.name}, can you please add feedback to Training : ${training.title}.`,
                        });
                    });    
                }
                hideConfirmHotRequestDialog();
            }).catch((error) => {
                setVerifyAlert("error");
                setVerifyAlertMessage("request_not_sent");
                setShowsVerifificationAlert(true);
            })
    }

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
    const TraineeStatusColors = {
        "confirmed": '#A5D6A7',
        "not_confirmed": '#FFCDD2',
    }

    const [selectedStatus, setSelectedStatus] = useState("all");

    const filteredAttendance = (attendance) =>
        {return Object.entries(attendance)
        .filter(([key, trainee]) => 
            selectedStatus === "all" || trainee.status === selectedStatus
        )
        .map(([key, form]) => form); 
    }

    const FilterColors = {
        "full": "#C8E6C9",
        "not_full": "#FFCDD2",
    }

    const [selectedFilter, setSelectedFiler] = useState("all");
    const [searchedTitle, setSearchedTitle] = useState('');
    const [applyFilter, setApplyFilter] = useState(false);
    const [TrainingTrainers, setTrainingTrainers] = useState([]);
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
            console.log("here");
        const response = await api.get('/api/users');
        if (response.status === 200) {
            const trainers = response.data
            .filter(user => user.role === "trainer" || user.role === "trainee_trainer")
            .map(user => ({ name: user.name, id: user._id }));

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
    }, []);

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
    ((selectedFilter === "all")
        || ((selectedFilter === "full")&&training.full) || (selectedFilter === "not_full"&&!training.full))
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

    // Selected Trainings.........
    const handleTrainingChange = (value, id) => {
        setTrainings((prevTrainings) => {
            const trainingKey = Object.keys(prevTrainings).find(
                (key) => prevTrainings[key]._id === id
            );
            if (!trainingKey) return prevTrainings;

            return {
                ...prevTrainings,
                [trainingKey]: {
                    ...prevTrainings[trainingKey],
                    selected: value,
                },
            };
        });
    };

    const [allTrainingsSelected, setAllTrainingsSelected] = useState(false);
    const updateAllTrainingsSelected = (value) => {
        setTrainings((prevTrainings) => {
            const updatedTrainings = {};

            Object.keys(prevTrainings).forEach((key) => {
                updatedTrainings[key] = {
                    ...prevTrainings[key],
                    selected: value,
                };
            });

            return updatedTrainings;
        });
    };

    const isAnyTrainingSelected = (trainings) => {
        return Object.values(trainings).some(training => training.selected);
    };

    const [showSendNewTrainingsEmail, setShowSendNewTrainingsEmail] = useState(false);
     
    const showSendTrainingsEmail = () => {
        setShowSendNewTrainingsEmail(true);
    }

    const hideSendTrainingsEmail = () => {
        setShowSendNewTrainingsEmail(false);
    }

    const [usersEmails, setUsersEmails] = useState("");

    const fetchUsersEmails = async () => {
        try {
            const response = await api.get("/api/users");
            const trainerEmails = response.data
            .filter(user => user.role !== "manager" && user.role !== "admin")
            .map(user => user.email)
            .join(",");
        setUsersEmails(trainerEmails);
        } catch (error) {
            console.error("Error fetching trainer emails", error);
        }
    }
    useEffect(() => {
        fetchUsersEmails();
    }, []);

    const [newTrainingsMessage, setNewTrainingsMessage] = useState("");

    const sendTrainingsEmail = async () => {
        try {
            const selectedTrainings = Object.values(trainings)
                .filter(t => t.selected)
                .map(t => {
                    const trainer = TrainingTrainers.find(trainer => trainer.id === t.trainer);
                    return {
                        ...t,
                        trainerName: trainer ? trainer.name : 'Trainer',
                    };
            });

            await api.post("/send-trainings-email", {
                toEmail: usersEmails,
                trainings: selectedTrainings, 
                message: newTrainingsMessage,
            });
            hideSendTrainingsEmail();
            setVerifyAlert("success");
            setVerifyAlertMessage("email_sent_successfully");
            setShowsVerifificationAlert(true);
        } catch (error) {
            console.error("Failed to send training emails:", error);
        }
    };


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
                    {t("trainings_list")}
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
                        onClick={() => setSelectedFiler("all")}
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
                        sx={{...buttonStyle, backgroundColor :"#C8E6C9"}}
                        onClick={() => setSelectedFiler("full")}
                    >
                    {selectedFilter === "full" && (
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
                        {numberOfFullTrainings}<br/>{t("full")}
                    </Button>
                    <Button 
                        sx={{...buttonStyle, backgroundColor :"#FFCDD2"}}
                        onClick={() => setSelectedFiler("not_full")}
                    >
                    {selectedFilter === "not_full" && (
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
                        {numberOfNotFullTrainings}<br/>{t("not_full")}
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
                        sx={{...buttonStyle, width: '15%', minWidth: '100px',position: "absolute", left: "10px", height: "50px"}}
                        disabled={!isAnyTrainingSelected(trainings)}
                        onClick={() => showSendTrainingsEmail()}
                    >
                        <Typography>
                            {t("send_trainings_email")}
                        </Typography>
                    </Button>
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
                        width: '90%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'start',
                        alignItems: 'center',
                        gap: '5px',
                        paddingRight: '25px',
                        }}
                    >
                        <Box sx={{ width: "40px" }}>
                            <Checkbox
                                checked={allTrainingsSelected}
                                onChange={(e) => {
                                        updateAllTrainingsSelected(e.target.checked);
                                        setAllTrainingsSelected(e.target.checked);
                                }}
                            />
                        </Box>
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
                            onClick={() => handleChangeTrainingOrder("nbOfParticipants")}
                        >
                            <Typography>
                                {t("nbOfParticipants")}
                            </Typography>
                            {selectedTrainingOrder === "nbOfParticipants" ? (trainingOrderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                    </Box>
                    <Box sx={{width:'10%', display:"flex", flexDirection:"row", justifyContent:"end"}}>
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
                                width: '90%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'start',
                                alignItems: 'center',
                                gap: '5px',
                                paddingRight: '25px',
                                }}
                        >
                            <Box sx={{ width: "40px" }}>
                                <Checkbox
                                    checked={training.selected}
                                    onChange={(e) => handleTrainingChange(e.target.checked, training._id)}
                                />
                            </Box>
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
                                placeholder={t("nbOfParticipants")}
                                size="small"
                                value={training.nbOfParticipants}
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
                        </Box> 
                        <Box 
                            sx={{width:'10%', display:"flex", flexDirection:"row", justifyContent:"end", alignItems: "center",}}
                            >
                            <Box
                                sx={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: training.full ? FilterColors.full : FilterColors.not_full,
                                marginRight: "10px",
                                }}
                            />
                            <Tooltip title={t("feedback_request")} arrow> 
                                <IconButton sx={{color:"#76C5E1"}} onClick={() => showSendFeedbackRequest(training._id)}>
                                    <FeedIcon/>
                                </IconButton>
                            </Tooltip>
                            <Badge badgeContent={trainingsHaveFeedbacks.includes(training._id) && numberOfNewFeedbacks ? 1 : 0} color="primary"
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
                                <Tooltip title={t("attendance")} arrow> 
                                    <IconButton sx={{color:"#76C5E1"}} onClick={() => showAttendeeListDialog(training._id)}>
                                        <GroupIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Badge>
                        </Box>
                    </Box>
                ))}
            </Box>
            <Dialog
            open={showAttendeeList}
            disableScrollLock={true}
            onClose={hideAttendeeListDialog}
            PaperProps={{
                sx: {
                    minWidth: "60%",
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
            <DialogTitle>{t("list_of_trainees")}</DialogTitle>
            {trainings && Object.values(trainings)
                .filter(training => training && training._id === selectedTrainingId)
                .map(training => (
                <Box key={training._id}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "20px",
                        width: "100%",
                    }}
                >
                    <Typography>
                        {t("training")} : {training.title}
                    </Typography>
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: "center",
                            alignItems: "center",
                            gap: '10px',
                        }}
                    >
                        <Button 
                            sx={buttonStyle}
                            onClick={() => setSelectedStatus("all")}
                        >
                        {selectedStatus === "all" && (
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
                            sx={{...buttonStyle, backgroundColor : "#A5D6A7"}}
                            onClick={() => setSelectedStatus("confirmed")}
                        >
                        {selectedStatus === "confirmed" && (
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
                           {training.numberOfConfirmed} <br/>{t("confirmed")}
                        </Button>
                        <Button 
                        sx={{
                            ...buttonStyle,
                            backgroundColor: "#FFCDD2",
                            position: "relative",
                        }}
                        onClick={() => setSelectedStatus("not_confirmed")}
                        >
                        {selectedStatus === "not_confirmed" && (
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
                        
                         {training.numberOfNotConfirmed}<br />
                        {t("not_confirmed")}
                        </Button>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                sx={{ width: '30%' }}
                                label={t("registration_deadline")}
                                value={newTrainingRegisDeadline}
                                onChange={(dateTime) => {
                                    setNewTrainingRegisDeadline(dateTime);
                                }}
                            />
                        </LocalizationProvider>
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
                        onClick={showHotFeedbacksDialog}
                        >
                            {t("hot_feedbacks")}
                        </Button>
                    </Box>
                    {filteredAttendance(training.trainees).map((trainee) => (
                        <Box 
                            key={trainee._id} 
                            sx={{
                                width: '750px',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: "background.paper",
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                                borderRadius: '10px',
                                paddingTop: '20px',
                                paddingBottom: '20px',
                                paddingLeft: '10px',
                                height: '50px',
                                gap: '20px',
                            }}
                        >
                            <Typography
                            >
                                {trainee.name}
                            </Typography>
                            <Typography
                            >
                                {trainee.email}
                            </Typography>
                            <Box sx={{ width: '30%',paddingRight: "10px", display: "flex", flexDirection: "row", justifyContent: "end" , alignItems:"center"}}>
                                <Box
                                    sx={{
                                        marginRight: '10px',
                                        width: "20px",
                                        height: "20px", 
                                        backgroundColor: TraineeStatusColors[trainee?.status],
                                        borderRadius: "50%",
                                    }}
                                />
                                {trainee?.status === "not_confirmed" && (
                                <Tooltip title={t("send_reminder")} arrow> 
                                    <IconButton sx={{color:"#76C5E1"}} onClick={() => showSendReminderDialog(trainee.email, training.title, trainee._id)}>
                                        <NotificationsActiveIcon/>
                                    </IconButton>
                                </Tooltip>)}
                                <Tooltip title={t("cold_feedback")} arrow> 
                                    <IconButton sx={{color:"#76C5E1"}} disabled={!traineesSetColdFeedbacks.includes(trainee._id)} onClick={() => showColdFeedbackDialog(training._id, trainee._id)}>
                                        <FeedIcon/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t("delete")} arrow>
                                    <IconButton sx={{ color: "#EA9696" }} onClick={() => showConfirmDeleteDialog(trainee.email, trainee.name, trainee._id)}>
                                        <CloseIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    ))}
                </Box>
            ))}
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
                    width: '100px',
                    height: '40px',
                    marginTop: '10px',
                    textTransform: "none",
                    '&:hover': {
                        backgroundColor: '#76C5E1',
                        color: 'white',
                    },
                }} 
                onClick={() => showConfirmChangeDeadlineDialog()}>
                    {t("save")}
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
                onClick={hideAttendeeListDialog}>
                    {t("ok")}
                </Button>
            </Box>
            </Dialog>
            <Dialog
                open={showHotFeedbacks}
                disableScrollLock={true}
                onClose={hideHotFeedbacksDialog}
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
            <DialogTitle>{t("hot_feedbacks")}</DialogTitle>
            {trainings && Object.values(trainings)
                .filter(training => training && training._id === selectedTrainingId)
                .map(training => (
                <Box key={training._id}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "20px",
                        width: "100%",
                    }}
                >
                {filteredAttendance(training.trainees).map((trainee, index) => (
                    <Box 
                        key={trainee._id} 
                        sx={{
                            width: '750px',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: "background.paper",
                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                            borderRadius: '10px',
                            paddingTop: '20px',
                            paddingBottom: '20px',
                            paddingLeft: '10px',
                            height: '50px',
                            gap: '20px',
                        }}
                    >
                        <Typography>
                        {t("trainee")} {index + 1}
                        </Typography>
                        <Box sx={{ width: '30%',paddingRight: "10px", display: "flex", flexDirection: "row", justifyContent: "end" , alignItems:"center"}}>
                            <Box
                                sx={{
                                    marginRight: '10px',
                                    width: "20px",
                                    height: "20px", 
                                    backgroundColor: TraineeStatusColors[trainee?.status],
                                    borderRadius: "50%",
                                }}
                            />
                            <Tooltip title={t("hot_feedback")} arrow> 
                                <IconButton sx={{color:"#76C5E1"}} disabled={!traineesSetHotFeedbacks.includes(trainee._id)} onClick={() => showHotFeedbackDialog(training._id, trainee._id)}>
                                    <FeedIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                ))}
            </Box>
            ))}
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
                    width: '100px',
                    height: '40px',
                    marginTop: '10px',
                    textTransform: "none",
                    '&:hover': {
                        backgroundColor: '#76C5E1',
                        color: 'white',
                    },
                }} 
                onClick={hideHotFeedbacksDialog}>
                    {t("ok")}
                </Button>
            </Box>
            </Dialog>
            <Dialog
                open={showColdFeedback}
                disableScrollLock={true}
                onClose={hideColdFeedbackDialog}
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
            <DialogTitle>{t("cold_feedback")}</DialogTitle>
            {feedbacks?.coldFeedback?.length !== 0 ? 
            <Box
                sx={{
                    width:"100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: '15px',
                    pointerEvents: "none", 
                    userSelect: "text",    
                    cursor: "default",      
                }}
            >
                <Typography
                
                >
                    {t("training")}
                </Typography>
                <TextField
                    label={t("theme")}
                    value={feedbacks?.coldFeedback?.[0]?.theme || ""}
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
                        value={feedbacks?.coldFeedback?.[0]?.association || ""}
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
                        value={feedbacks?.coldFeedback?.[0]?.trainer || ""}
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
                        gap: '10px',
                    }}
                >
                    <TextField
                        label={t("date")}
                        value={feedbacks?.coldFeedback?.[0]?.trainingDate || ""}
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
                        value={feedbacks?.coldFeedback?.[0]?.location || ""}
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
                        label={t("name")}
                        value={feedbacks?.coldFeedback?.[0]?.name || ""}
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
                        label={t("registration_number")}
                        value={feedbacks?.coldFeedback?.[0]?.matricule || ""}
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
                        gap: '10px',
                    }}
                >
                    <TextField
                        label={t("function")}
                        value={feedbacks?.coldFeedback?.[0]?.function || ""}
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
                        label={t("service")}
                        value={feedbacks?.coldFeedback?.[0]?.service || ""}
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
                <Typography
                >
                    {t("participant")} {t("evaluation")} 
                </Typography>
                <FormPreview 
                    formFields={formFields} 
                    fieldValues={fieldValues} 
                />
            </Box>
            :feedbacks?.coldFeedback?.length === 0 ?
            <Typography
                sx={{
                    width: "100%",
                    display:'flex',
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {t("cold_feedback_not_submited_yet")}
            </Typography>:null}           
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
                    width: '100px',
                    height: '40px',
                    marginTop: '10px',
                    textTransform: "none",
                    '&:hover': {
                        backgroundColor: '#76C5E1',
                        color: 'white',
                    },
                }} 
                onClick={hideColdFeedbackDialog}>
                    {t("ok")}
                </Button>
            </Box>
            </Dialog>
            <Dialog
                open={showHotFeedback}
                disableScrollLock={true}
                onClose={hideHotFeedbackDialog}
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
            <DialogTitle>{t("hot_feedback")}</DialogTitle>
            {feedbacks?.hotFeedback?.length !== 0 ? 
            <Box     
                sx={{
                    width:"100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: '10px',
                    pointerEvents: "none", 
                    userSelect: "text",    
                    cursor: "default", 
                }}
            >
                <Typography
                
                >
                    {t("training")}
                </Typography>
                <TextField
                    label={t("theme")}
                    value={feedbacks?.hotFeedback?.[0]?.theme || ""}
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
                        value={feedbacks?.hotFeedback?.[0]?.association || ""}
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
                        value={feedbacks?.hotFeedback?.[0]?.trainer || ""}
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
                        gap: '10px',
                    }}
                >
                    <TextField
                        label={t("date")}
                        value={feedbacks?.hotFeedback?.[0]?.trainingDate || ""}
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
                        value={feedbacks?.hotFeedback?.[0]?.location || ""}
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
                <Typography
                
                >
                    {t("evaluation")}
                </Typography>
                <FormPreview 
                    formFields={formFields} 
                    fieldValues={fieldValues} 
                />
            </Box>
            :feedbacks?.hotFeedback?.length === 0 ?
            <Typography
                sx={{
                    width: "100%",
                    display:'flex',
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {t("hot_feedback_not_submited_yet")}
            </Typography> 
            :null}           
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
                    width: '100px',
                    height: '40px',
                    marginTop: '10px',
                    textTransform: "none",
                    '&:hover': {
                        backgroundColor: '#76C5E1',
                        color: 'white',
                    },
                }} 
                onClick={hideHotFeedbackDialog}>
                    {t("ok")}
                </Button>
            </Box>
            </Dialog>
            <Dialog
            open={sendFeedbackRequest}
            disableScrollLock={true}
            onClose={hideSendFeedbackRequest}
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
            <DialogTitle>{t("feedback_request")}</DialogTitle>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyItems: "center",
                    alignItems: "center",
                }}
            >
                <Typography>
                    {t("feedback_type")}
                </Typography>
                <Box 
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                }}>
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
                    onClick={showConfirmColdRequestDialog}
                    >
                        {t("cold_feedback")}
                    </Button>
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
                    onClick={showConfirmHotRequestDialog}
                    >
                        {t("hot_feedback")}
                    </Button>
                </Box>
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
                onClick={hideSendFeedbackRequest}>
                    {t("cancel")}
                </Button>
            </Box>
            </Dialog>
            <Dialog
            open={confirmColdRequest}
            disableScrollLock={true}
            onClose={hideConfirmColdRequestDialog}
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
            <DialogTitle>{t("request_cold_feedback")}?</DialogTitle>
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
                onClick={hideConfirmColdRequestDialog}>
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
                onClick={() => sendColdRequest(selectedTrainingId)} 
                >
                    {t("yes")}
                </Button>
            </Box>
            </Dialog>
            <Dialog
            open={confirmHotRequest}
            disableScrollLock={true}
            onClose={hideConfirmHotRequestDialog}
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
            <DialogTitle>{t("request_hot_feedback")}?</DialogTitle>
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
                onClick={hideConfirmHotRequestDialog}>
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
                onClick={() => sendHotRequest(selectedTrainingId)} 
                >
                    {t("yes")}
                </Button>
            </Box>
            </Dialog>
            <Dialog
            open={showSendReminder}
            disableScrollLock={true}
            onClose={hideSendReminderDialog}
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
            <DialogTitle>{t("send_reminder")} ?</DialogTitle>
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
                onClick={hideSendReminderDialog}>
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
                onClick={() => handleSendReminder(mail, trainingName, traineeId)} 
                >
                    {t("yes")}
                </Button>
            </Box>
            </Dialog>
            <Dialog
            open={showConfirmDelete}
            disableScrollLock={true}
            onClose={hideConfirmDeleteDialog}
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
            <DialogTitle>{t("confirm_delete_trainee")}?</DialogTitle>
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
                onClick={hideConfirmDeleteDialog}>
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
                onClick={() => handleUpdateAttendanceList()}>
                    {t("yes")}
                </Button>
            </Box>
            </Dialog>
            <Dialog
            open={confirmChangeDeadline}
            disableScrollLock={true}
            onClose={hideConfirmChangeDeadlineDialog}
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
            <DialogTitle>{t("confirm_deadline_change")} ?</DialogTitle>
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
                onClick={hideConfirmChangeDeadlineDialog}>
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
                onClick={() => handleUpdateTrainingRegisDeadline(selectedTrainingId)} 
                >
                    {t("yes")}
                </Button>
            </Box>
            </Dialog>
             <Dialog
            open={showSendNewTrainingsEmail}
            disableScrollLock={true}
            onClose={hideSendTrainingsEmail}
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
            <DialogTitle>{t("confirm_send_email")} ?</DialogTitle>
             <FormControl
                variant="outlined"
                sx={{
                    width: '100%',
                }}
                >
                <InputLabel required>{t("message")}</InputLabel>
                <OutlinedInput
                    multiline
                    minRows={8}
                    value={newTrainingsMessage}
                    onChange={(e) => setNewTrainingsMessage(e.target.value)}
                    label={t("message")}
                    sx={{
                    height: 'auto',
                    alignItems: 'flex-start'
                    }}
                />
            </FormControl>
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
                onClick={hideSendTrainingsEmail}>
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
                onClick={() => sendTrainingsEmail()}
                >
                    {t("yes")}
                </Button>
            </Box>
            </Dialog>
            <Snackbar open={showsVerificationAlert} autoHideDuration={3000} onClose={handleVerificationAlertClose}>
                <Alert onClose={handleVerificationAlertClose} severity={verifyAlert} variant="filled">
                    {t(verifyAlertMessage)}
                </Alert>
            </Snackbar>
            <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
            />
        </Box>
    )
}

export default ManageTrainings;