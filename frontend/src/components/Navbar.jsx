import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../themecontext';
import { getCookie , setCookie} from './Cookies';
import { Box, Link, Typography, Menu, MenuItem, Dialog, Button, DialogTitle, Badge, Snackbar, Alert,
    OutlinedInput,InputLabel,FormControl,Tooltip,IconButton,FormControlLabel, Radio, RadioGroup, Checkbox,TextField
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import Logo from "../assets/Telnet.png";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import AddchartIcon from '@mui/icons-material/Addchart';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ChecklistIcon from '@mui/icons-material/Checklist';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LanguageIcon from '@mui/icons-material/Language';
import axios from 'axios';
import { useNavbar } from '../NavbarContext';
import io from "socket.io-client";
import { useLanguage } from "../languagecontext";

const Navbar = () => {

    const { t, setLanguage } = useLanguage();
    const [choosedLanguage, setChoosedLanguage] = useState(getCookie("Language") || "en");
    const { darkMode, toggleTheme } = useContext(ThemeContext);
    const [signedIn, setSignedIn] = useState(getCookie("SignedIn"));
    // Verify Everything

    const [showsVerificationAlert, setShowsVerifificationAlert] = useState(false);
    const [verifyAlertMessage, setVerifyAlertMessage] = useState("");
    const [verifyAlert, setVerifyAlert] = useState("error");
    const handleVerificationAlertClose = () => {
        setShowsVerifificationAlert(false);
    };

    // Menu .............

    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const handleMenuAnchorEl = (event) => setMenuAnchorEl(event.currentTarget);
    const handleOpenMenu = () => setMenuOpen(true);
    const handleCloseMenu = () => {
        setMenuOpen(false);
        setMenuAnchorEl(null);
    };

    //SubMenu .................
    const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
    const handleOpenSubmenu = (e) => {
        setSubmenuAnchorEl(e.currentTarget);
    };
    const handleCloseSubmenu = () => {
        setSubmenuAnchorEl(null);
    };

    const UserRoles = ["trainer", "trainee"];
    const [selectedRole, setSelectedRole] = useState(getCookie("Role") || "trainer");
    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setCookie("Role", role , 1000);
        setSubmenuAnchorEl(null);
        window.location.href = role === "trainee" ? '/traineesession' : '/trainersession';
    };
    const chosenRole = getCookie("Role") || "trainer";

    const toggleLanguage = () => {
        const newLanguage = choosedLanguage === "en" ? "fr" : "en";
        setChoosedLanguage(newLanguage);
        setLanguage(newLanguage);
        setCookie("Language", newLanguage, 5);
    };

    const ProfileImage = getCookie("ProfileImage");

    const navigate = useNavigate();

    const goToDashBoard = () =>{
        navigate("/dashboard");
    };

    const user = getCookie("User") ?? null;


    const location = useLocation();

    // Notfications
    const socket = io("http://localhost:5000"); 
    const [callMessage, setCallMessage] = useState("");
    const [numberOfCalls, setNumberOfCalls] = useState(0);
    const {numberOfTrainingsStatus, setNumberOfTrainingsStatus} = useNavbar();
    const {numberOfTrainingRequests, setNumberOfTrainingRequests} = useNavbar();
    const {numberOfTraineeRequests, setNumberOfTraineeRequests} = useNavbar();
    const [numberOfConfirmAttendance, setNumberOfConfirmAttendance] = useState(0);
    const [confirmedTrainees, setConfirmedTrainees] = useState([]);
    const [numberOfRoleChanged, setNumberOfRoleChanged] = useState(0);
    const {numberOfDeletedTrainee, setNumberOfDeletedTrainee} = useNavbar();
    const {numberOfRequestsReponses, setNumberOfRequestsReponses} = useNavbar();
    const { numberOfNewFeedbacks, setNumberOfNewFeedbacks } = useNavbar();
    const { numberOfNewFeedbacksReq ,setNumberOfNewFeedbacksReq } = useNavbar();
    const [numberOfRequestRoleTrainee, setNumberOfRequestRoleTrainee] = useState(0);
    const [listOfRequests, setListOfRequests] = useState([]);
    const {numberOfQuizFromTrainer, setNumberOfQuizFromTrainer}= useNavbar();
    const {numberOfQuizFromTrainee, setNumberOfQuizFromTrainee}= useNavbar();

    const fetchNotifications = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/notifications/noread", {rec : user._id });
            const callForTrainersNotif = response.data.notifications.filter(notification => notification.type === "Call_For_Trainers");
            const confirmAttendanceNotfi = response.data.notifications.filter(notification => notification.type === "Trainee_Confirmed_Attendance");
            const trainingRequestNotif = response.data.notifications.filter(notification => notification.type === "New_Training_Request");
            const trainingStatusNotif = response.data.notifications.filter(notification => notification.type === "New_Training_Status");
            const traineeRequestNotif = response.data.notifications.filter(notification => notification.type === "New_Trainee_Request");
            const feedbackNotif = response.data.notifications.filter(notification => notification.type === "New_Feedback");
            const roleChangeNotif = response.data.notifications.filter(notification => notification.type === "Role_Changed");
            const deletedTraineeNotif = response.data.notifications.filter(notification => notification.type === "Deleted_Trainee_From_Training");
            const requestTraineeRole = response.data.notifications.filter(notification => notification.type === "Request_Become_Trainee");
            const quizFromTrainer = response.data.notifications.filter(notification => notification.type === "Quiz_Uploaded_From_Trainer");
            const quizFromTrainee = response.data.notifications.filter(notification => notification.type === "Quiz_Uploaded_From_Trainee");
            const requestResponseNotif = response.data.notifications.filter(notification => notification.type === "Request_Accepted" || notification.type === "Request_Rejected");
            const feedbackReqNotif = response.data.notifications.filter(notification => notification.type === "Request_Cold_Feedback" || notification.type === "Request_Hot_Feedback");
            setNumberOfCalls(callForTrainersNotif.length);
            setNumberOfConfirmAttendance(confirmAttendanceNotfi.length);
            setNumberOfTrainingRequests(trainingRequestNotif.length);
            setNumberOfTraineeRequests(traineeRequestNotif.length);
            setNumberOfNewFeedbacks(feedbackNotif.length);
            setNumberOfNewFeedbacksReq(feedbackReqNotif.length);
            setNumberOfTrainingsStatus(trainingStatusNotif.length);
            setNumberOfRoleChanged(roleChangeNotif.length);
            setNumberOfRequestsReponses(requestResponseNotif.length);
            setNumberOfDeletedTrainee(deletedTraineeNotif.length);
            setNumberOfRequestRoleTrainee(requestTraineeRole.length);
            setNumberOfQuizFromTrainee(quizFromTrainee.length);
            setNumberOfQuizFromTrainer(quizFromTrainer.length);

            setConfirmedTrainees([]);
            const availableAttendanceConfirmations = await axios.post("http://localhost:5000/api/notifications/withtype", {rec : user._id, tp : "Trainee_Confirmed_Attendance"});
            availableAttendanceConfirmations.data.notifications.forEach(notification => {
                axios.get(`http://localhost:5000/api/users/${notification.sender}`)
                    .then(response => {
                        const trainee = response.data;
                        trainee.new = !notification.isRead;
                        axios.get(`http://localhost:5000/api/trainings/${notification.message}`)
                            .then(response => {
                                const training = response.data;
                                trainee.trainingTitle = training.title;
                                setConfirmedTrainees((prevConfirmedTrainees) => [...prevConfirmedTrainees, trainee]);
                            })
                            .catch(error => {
                                console.error("Error fetching training", error);
                            });
                    })
                    .catch(error => {
                        console.error("Error fetching trainee", error);
                    });
            });
            setListOfRequests([]);
            const availableRequests = await axios.post("http://localhost:5000/api/notifications/withtype", {rec : user._id, tp : "Request_Become_Trainee"});
            availableRequests.data.notifications.forEach(notification => {
                axios.get(`http://localhost:5000/api/users/${notification.sender}`)
                    .then(response => {
                        const trainer = response.data;
                        trainer.new = !notification.isRead;
                        trainer.message = notification.message;
                        setListOfRequests((prevListOfRequests) => [...prevListOfRequests, trainer]);
                    })
                    .catch(error => {
                        console.error("Error fetching trainee", error);
                    });
            });
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    const [trainersEmails, setTrainersEmails] = useState("");

    const fetchTrainersEmails = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/users");
            const trainerEmails = response.data
            .filter(user => user.role !== "manager")
            .map(user => user.email)
            .join(",");
        setTrainersEmails(trainerEmails);
        } catch (error) {
            console.error("Error fetching trainer emails", error);
        }
    }
    useEffect(() => {
        fetchTrainersEmails();
    }, []);

    useEffect(() => {
        if (!user) return; 
    
        if (!socket.connected) {
            socket.connect();
        }
    
        fetchNotifications();
        socket.emit("joinRoom", user._id);
    
        socket.on("newNotification", () => {
            fetchNotifications();
        });
    
        socket.on("readCallNotifications", () => {
            setNumberOfCalls(0);
        });
    
        socket.on("readTrainingRequestNotifications", () => {
            setNumberOfTrainingRequests(0);
        });

        socket.on("readTraineeRequestNotifications", () => {
            setNumberOfTraineeRequests(0);
        });


        socket.on("readConfirmNotifications", () => {
            setNumberOfConfirmAttendance(0);
        });

        socket.on("readFeedbackNotifications", () => {
            setNumberOfNewFeedbacks(0);
        });

        socket.on("readFeedbackReqNotifications", () => {
            setNumberOfNewFeedbacksReq(0);
        });

        socket.on("readTrainingsStatusNotifications", () => {
            setNumberOfTrainingsStatus(0);
        });

        socket.on("readRequestsResponsesNotifications", () => {
            setNumberOfTrainingsStatus(0);
        });

        socket.on("readRequestTraineeNotifications", () => {
            setNumberOfRequestRoleTrainee(0);
        });

        socket.on("readTrainerQuizNotifications", () => {
            setNumberOfQuizFromTrainer(0);
        });

        return () => {
            socket.off("newNotification");
            socket.off("readNotifications");
        };
    }, []);
    
    const handleOpenCallNotifications = async () => {
        try {
          await axios.put("http://localhost:5000/api/notifications/markread", {rec : user._id, tp : "Call_For_Trainers", rtp : "readCallNotifications"});
          setNumberOfCalls(0); 
        } catch (error) {
          console.error("Error marking notifications as read", error);
        }
    };

    const handleOpenFeedbackNotification = async () => {
        try {
          await axios.delete("http://localhost:5000/api/notifications", { data : {rec : user._id, tp : "New_Feedback"}});
          setNumberOfNewFeedbacks(0);
        } catch (error) {
          console.error("Error marking notifications as read", error);
        }
    };


    const [showListOfConfirmedTrainees, setShowListOfConfirmedTrainees] = useState(false);

    const openListOfConfirmedTrainees = () => {
        setShowListOfConfirmedTrainees(true);
    };

    const closeListOfConfirmedTrainees = () => {
        setShowListOfConfirmedTrainees(false);
        handleOpenConfirmAttendanceNotifications();
    }

    const handleOpenConfirmAttendanceNotifications = async () => {
        try {
          await axios.put("http://localhost:5000/api/notifications/markread", {rec : user._id, tp : "Trainee_Confirmed_Attendance", rtp : "readConfirmNotifications"});
          setNumberOfConfirmAttendance(0);
        } catch (error) {
          console.error("Error marking notifications as read", error);
        }
    };

    // Call For Trainers ......

    const [verifyCallForTrainers, setVerifyCallForTrainers] = useState(false);
    const [searchedTrainer, setSearchedTrainer] = useState("");

    const [TrainingTrainers, setTrainingTrainers] = useState([]);
    const fetchTrainers = async () => {
        try {
        const response = await axios.get('http://localhost:5000/api/users');
        if (response.status === 200) {
            const trainers = response.data
            .filter(user => user.role === "trainer" || user.role === "trainee_trainer")
            .map(user => ({ name: user.name, id: user._id, selected: false, email:user.email }));
  
            setTrainingTrainers(trainers);
        }
        } catch (error) {
        console.error("Error fetching trainers:", error);
        }
    };
    useEffect(() => {
        fetchTrainers();
      }, []);
    const toggleTrainerSelection = (trainerId) => {
        setTrainingTrainers(prev =>
          prev.map(trainer =>
            trainer.id === trainerId
              ? { ...trainer, selected: !trainer.selected }
              : trainer
        )
    );
    };  
    
    const filteredTrainers = TrainingTrainers.filter(trainer => 
        trainer.name.toLowerCase().includes(searchedTrainer.toLowerCase())
    );

    const [callType , setCallType] = useState("all");

    const openCallForTrainers = () => {
        setVerifyCallForTrainers(true);
    };

    const closeCallForTrainers = () => {
        setVerifyCallForTrainers(false);
    };

    const sendCallForTrainers = async () => {
        try {
            let selectedTrainerEmails = [];
            let selectedTrainerIds = [];
            if (callType === 'specify') {
                selectedTrainerEmails = TrainingTrainers
                    .filter(trainer => trainer.selected)
                    .map(trainer => trainer.email); 
                selectedTrainerIds = TrainingTrainers
                    .filter(trainer => trainer.selected)
                    .map(trainer => trainer.id); 

                const response = await axios.post("http://localhost:5000/api/users/callforspecifiedtrainers", {
                    trainersIDs: selectedTrainerIds,
                    sen: user._id,
                    tp: "Call_For_Trainers",
                    msg: callMessage,
                });
    
                if (response.data.success) {
                    await axios.post("http://localhost:5000/call-for-trainers", {
                        toEmail: selectedTrainerEmails,
                        message: callMessage,
                    });
                }
    
            } else {
                const response = await axios.post("http://localhost:5000/api/users/callfortrainers", {
                    sen: user._id,
                    tp: "Call_For_Trainers",
                    msg: callMessage,
                });
    
                if (response.data.success) {
                    await axios.post("http://localhost:5000/call-for-trainers", {
                        toEmail: trainersEmails, 
                        message: callMessage,
                    });
                }
            }
    
            setVerifyAlert("success");
            setVerifyAlertMessage("Call sent successfully!");
            setShowsVerifificationAlert(true);
            closeCallForTrainers();
    
        } catch (error) {
            console.error("Error sending call for trainers:", error);
        }
    };
    
    

    //Became Trainee ...............

    const [becomeTraineeConfirm, setBecomeTraineeConfirm] = useState(false);
    const [becomeTraineeMessage, setBecomeTraineeMessage] = useState("");
    const [showListOfRequests, setShowListOfRequests] = useState(false);

    const openListOfRequests = () => {
        setShowListOfRequests(true);
    };

    const closeListOfRequests = async () => {
        setShowListOfRequests(false);
        try {
            await axios.put("http://localhost:5000/api/notifications/markread", {rec : user._id, tp : "Request_Become_Trainee", rtp : "readRequestTraineeNotifications"});
            setNumberOfRequestRoleTrainee(0);
          } catch (error) {
            console.error("Error marking notifications as read", error);
          }
    };

    const deleteRequestToBecomeTrainee = async (userId) => {
        await axios.delete("http://localhost:5000/api/notifications", {
            data: {
              rec : user._id,
              sen : userId,
              tp : "Request_Become_Trainee",
            }
        }).then(() => {
            fetchNotifications();
        })
    }

    const notifyRoleChangeToTrainee = async (userId) => {
        try {
            await axios.post("http://localhost:5000/api/notifications/rolechange", {rec: userId, sen:user._id,tp:"Role_Changed", msg:"your_role_updated_to_trainee_trainer" });
        } catch (error) {
            console.error("Error sending request:", error);
        }
    }

    const handleAddTrainee = async (userId) => {
        try {
            console.log("User ID:", userId);
            await axios.put(`http://localhost:5000/api/users/${userId}`, {role : "trainee_trainer"});
            setVerifyAlert("success");
            setVerifyAlertMessage("request_accepted");
            setShowsVerifificationAlert(true);
        } catch (error) {
            console.error("Error sending request:", error);
        }
    }

    const openBecomeTraineeConfrim = () => {
        setBecomeTraineeConfirm(true);
    }

    const closeBecomeTraineeConfirm = () => {
        setBecomeTraineeConfirm(false);
    }

    const handleBecomeTrainee = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/notifications/rolechange/managers", {
                sen: user._id,
                tp: "Request_Become_Trainee",
                msg: becomeTraineeMessage
            });
            if (response.data.success) {
                closeBecomeTraineeConfirm();
                setVerifyAlert("success");
                setVerifyAlertMessage("Request sent successfully!");
                setShowsVerifificationAlert(true);
            }
        } catch (error) {
            console.error("Error sending request:", error);
            setVerifyAlert("error");
            setVerifyAlertMessage("Failed to send request!");
            setShowsVerifificationAlert(true);
        }
    };

    // Set Trainings Cost .........
    
    const [trainingsCost, setTrainingsCost] = useState(false);
    const [cost, setCost] = useState(0);

    const showTrainingsCost = async () => {
        let currentCost = 0;
        await axios.get("http://localhost:5000/api/trainings")
            .then((response) => {
                setCost(response.data[0].trainingsCost);
            })
        setTrainingsCost(true);
    };

    const hideTrainingsCost = () => {
        setTrainingsCost(false);
    }

    const handleChangeCost = async () => {
        await axios.put("http://localhost:5000/api/trainings" , {trainingsCost : cost})
            .then((response) => {
                hideTrainingsCost();
                setVerifyAlert("success");
                setVerifyAlertMessage("cost_changed_successfully");
                setShowsVerifificationAlert(true);
            })
            .catch ((error) => {
                console.error("Error getting :", error);
                setVerifyAlert("error");
                setVerifyAlertMessage("Failed to send request!");
                setShowsVerifificationAlert(true);
            })    
    }


    // Logout


    const handleLogout = async() => {
        try {
            await axios.delete("http://localhost:5000/api/notifications", {
            data: {
                rec: user._id,
                tp: "Role_Changed"
              }})
                .then(() => {
                    setNumberOfRoleChanged(0);
                    setSignedIn(false);
                    setCookie("SignedIn",false,5);
                    window.location.href = "/";
                })
          } catch (error) {
            console.error("Error marking notifications as read", error);
          }
    };
    

    //Styles................................

    const linkStyle = (loc) => ({
        color: location.pathname === loc ? 'white' : 'text.secondary',
        backgroundColor: location.pathname === loc ? '#2CA8D5' : 'background.navbar',
        textDecoration: 'none',
        padding: '5px',
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '&:hover': {
          backgroundColor: '#76C5E1',
          color: 'white',
        },
    });

    const buttonStyle = {
        color: 'white',
        backgroundColor: '#2CA8D5',
        padding: '5px 10px',
        borderRadius: '10px',
        textDecoration: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: signedIn ? '100%' : '25%',
        height: '65%',
        fontWeight: 'bold',
    };

    const menuStyle = (loc) => ({
        zIndex: 1,
        width: '250px',
        height: '50px',
        backgroundColor : location.pathname === loc ? 'grey' : 'background.primary'
    });

    const profileImageStyle = {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        marginRight: '10px',
    };

    const roleStyle = (role) => ({
        color: "text.primary",
        backgroundColor: role === chosenRole? "#2CA8D5" : "background.primary",
        textDecoration: 'none',
        padding: '5px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: "100px",
        '&:hover': {
            backgroundColor: "#76C5E1",
        },
    });

    return (
        <Box
            sx={{
                width: '100%',
                backgroundColor: "background.navbar",
                position: 'relative',
                display: "flex",
                boxSizing: "border-box",
                height: "70px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)"
            }}
        >
            <Box 
               sx={{
                width: '200px',
                height: 'cover',
                backgroundImage: `url(${Logo})`,
                backgroundSize: "80%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                cursor: "pointer",
               }}
               onClick={goToDashBoard}          
            >   
            </Box>
            {signedIn && user ? <Box
                sx={{
                    position: 'absolute',
                    left: '40%',
                    width: '45%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    color: 'black',
                    gap: '20px',
                }}
            >
                <Link href="/dashboard" sx={linkStyle('/dashboard')}>{t("dashboard")}</Link>
                <Badge badgeContent={numberOfQuizFromTrainee} color="primary"
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
                <Link href={(user.role === "trainer" || user.role === "trainee_trainer" && chosenRole === "trainer") ? '/trainersession' : (user.role === "trainee" || user.role === "trainee_trainer" && chosenRole === "trainee") ? '/traineesession' : user.role === 'manager' ? '/managesessions' : ''} 
                sx={linkStyle((user.role === "trainer" || user.role === "trainee_trainer"&& chosenRole === "trainer") ? '/trainersession' : (user.role === "trainee" || user.role === "trainee_trainer" && chosenRole === "trainee") ? '/traineesession' : user.role === 'manager' ? '/managesessions' : '')}>{t("sessions")}</Link>
                </Badge>
                {user.role === "manager" ? <Link href="/managetrainings" sx={linkStyle('/managetrainings')}>{t("trainings")}</Link>:null}
                {!(user.role) ?  <Link href="/manageusers" sx={linkStyle('/manageusers')}>{t("users")}</Link> : 
                (user.role === "manager")? 
                <Badge badgeContent={numberOfTrainingRequests + numberOfTraineeRequests} color="primary"
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
                <Link
                    href="/requests"
                    sx={linkStyle('/requests')}
                >
                    {t("requests")}
                </Link>
                </Badge> : (user.role === "trainer" || user.role === "trainee_trainer" && chosenRole === "trainer")?
                            <Badge badgeContent={numberOfTrainingsStatus} color="primary"
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
                                <Link href="/trainertraining" sx={linkStyle('/trainertraining')}
                                >{t("trainings")}</Link>
                            </Badge>
                              :
                             <Badge badgeContent={numberOfNewFeedbacksReq+numberOfRequestsReponses+numberOfDeletedTrainee+numberOfQuizFromTrainer} color="primary"
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
                             <Link href="/enrolledtrainee" sx={linkStyle('/enrolledtrainee')}
                             >{t("trainings")}</Link></Badge> }
                <Link href="/calendar" sx={linkStyle('/calendar')}>{t("calendar")}</Link>
                <Link href="/contact" sx={linkStyle('/contact')}>{t("contact")}</Link>
                <Link href="/about" sx={linkStyle('/about')}>{t("about")}</Link>
            </Box> : null}
            {!signedIn ? 
            <Box
                sx={{
                    position: 'absolute',
                    right: '10px',
                    width: '35%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '30px',
                }}
            >
                <Link href="/" 
                sx={{...buttonStyle,                    
                    color: location.pathname === "/" ? "white" : "text.secondary",
                    backgroundColor: location.pathname === "/" ? "#2CA8D5" : "background.paper",
                }}>{t("home")}</Link>
                <Link href="/signin"  
                sx={{...buttonStyle,                    
                    color: location.pathname === "/signin" ? "white" : "text.secondary",
                    backgroundColor: location.pathname === "/signin" ? "#2CA8D5" : "background.paper",
                }}>{t("signin")}</Link>
                 <Box                
                    sx={{
                        position: 'absolute',
                        right: '20px',
                        height: '100%',
                        width: '25%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'end',
                    }}
                >
                    <Link href="" sx={{...buttonStyle,
                        color: menuOpen ? "white" : "text.secondary",
                        backgroundColor: menuOpen? "#76C5E1" : "background.paper",
                        width:'100%'
                    }} 
                    onMouseEnter={(event) => {
                        handleOpenMenu();
                        handleMenuAnchorEl(event);
                    }}
                    >
                        <SettingsIcon
                            sx={{
                                marginRight: '5px',
                            }}
                        ></SettingsIcon>
                        <Typography>
                            {t("settings")}
                        </Typography>
                    </Link>
                    <Menu anchorEl={menuAnchorEl} open={menuOpen} onClose={handleCloseMenu}
                    MenuListProps={{
                        onMouseLeave: handleCloseMenu, 
                    }}
                    disableScrollLock={true}
                    >
                        <MenuItem sx={menuStyle("")}>
                            {t("settings")}
                        </MenuItem>
                        <MenuItem sx={menuStyle("")} onClick={toggleTheme}>
                            {darkMode ? <Brightness7Icon sx={{marginRight:'5px'}}/> : <Brightness4Icon sx={{marginRight:'5px'}}/>}
                            {darkMode? t("light_mode") : t("dark_mode")}
                        </MenuItem>
                        <MenuItem sx={menuStyle("")} onClick={toggleLanguage}>
                            <LanguageIcon sx={{marginRight:'5px'}}/>
                            {choosedLanguage === "en" ? t("french") : t("english")}
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>
            : user ?
            <Box                
                sx={{
                    position: 'absolute',
                    right: '20px',
                    width: 'auto',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'end',
                }}
            >
                {user.role === "trainee_trainer" ?
                <Typography
                    sx={{
                    width: '200px',
                    height: 'cover',
                    display: "flex",
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'text.secondary',
                    cursor: "pointer",
                    }}>
                    {t(selectedRole)}
                </Typography> : null}
                <Link href="/account" sx={{...buttonStyle,
                    color: menuOpen ? "white" : location.pathname === "/account" ? "white" : "text.secondary",
                    backgroundColor: menuOpen? "#76C5E1" : location.pathname === "/account" ? "#2CA8D5" : "background.paper",
                    width:'auto'
                }} 
                onMouseEnter={(event) => {
                    handleMenuAnchorEl(event);
                    handleOpenMenu();
                }}              
                >
                    <Badge badgeContent={numberOfCalls+numberOfConfirmAttendance+numberOfNewFeedbacks+numberOfRoleChanged+numberOfRequestRoleTrainee} color="primary"
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
                        {ProfileImage ? <img src={ProfileImage} alt="Img" style={profileImageStyle}/>:
                        <AccountCircleIcon  sx={{marginRight:"10px"}} />
                        }
                    </Badge>
                    <Typography>
                        {user.name}
                    </Typography>
                </Link>
                <Menu anchorEl={menuAnchorEl} open={menuOpen} onClose={handleCloseMenu}
                disableScrollLock={true}
                >
                    <MenuItem sx={{ ...menuStyle(""), height: "60px", display: "flex", flexDirection: "column", alignItems: "start" }} onMouseEnter={handleCloseSubmenu}>
                        <Typography variant="body1">{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.role ? t(user.role) : t("admin")}</Typography>
                    </MenuItem>
                    {!(user.role) ? <MenuItem onClick={() => window.location.href = "/manageusers"} sx={menuStyle("/manageusers")}><ManageAccountsIcon sx={{marginRight:'10px'}}/>{t("manage")}</MenuItem> : null}
                    {(user.role === "trainee_trainer") ? 
                    <MenuItem 
                        onClick={(e) => {
                            handleOpenSubmenu(e)
                        }}
                     sx={menuStyle("")}>
                    <ChangeCircleIcon sx={{marginRight:'5px'}}/>{t("change_space")}
                    </MenuItem> : null}
                    <Menu
                        anchorEl={submenuAnchorEl}
                        open={Boolean(submenuAnchorEl)}
                        onClose={handleCloseSubmenu}
                        disableScrollLock={true}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                            }}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                    >
                        <MenuItem >
                            {t("role")} 
                        </MenuItem>
                        {UserRoles.map((role) => (
                            <MenuItem key={role} value={role} sx={roleStyle(role)} onClick={() => handleRoleChange(role)}>
                                {t(role)} 
                            </MenuItem>
                        ))}
                    </Menu>
                    {(user.role !== "manager") ? 
                    <MenuItem onClick={() => {
                        handleOpenCallNotifications();
                        window.location.href = "/trainercall";}}
                    sx={menuStyle("/trainercall")}>
                    <Badge badgeContent={numberOfCalls} color="primary"
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
                    > <NotificationsIcon sx={{marginRight:'10px'}}/>
                    </Badge>
                    {t("training_calls")}
                    </MenuItem>
                    : null}
                    {user.role === "trainee" ? <MenuItem onClick={() => window.location.href = "/becometrainer"} sx={menuStyle("/becometrainer")}><PersonIcon sx={{marginRight:'10px'}}/>{t("become_trainer")}</MenuItem> : null}
                    {user.role === "trainer" ? <MenuItem onClick={() => openBecomeTraineeConfrim()} sx={menuStyle("/becometrainee")}><PersonIcon sx={{marginRight:'10px'}}/>{t("become_trainee")}</MenuItem> : null}
                    {user.role === "manager" ? <MenuItem  sx={menuStyle("/req")} onClick={() => openListOfRequests()}>
                    <Badge
                            badgeContent={numberOfRequestRoleTrainee}
                            color="primary"
                            sx={{
                                "& .MuiBadge-badge": {
                                fontSize: "10px",
                                height: "16px",
                                minWidth: "16px",
                                padding: "2px",
                                position: "absolute",
                                right: "10px",
                                },
                            }}
                            >
                    <PersonIcon sx={{marginRight:'10px'}}/>
                    </Badge>{t("requests")}</MenuItem> : null}
                    {user.role === 'manager' ? <MenuItem  sx={menuStyle("/settrainingscost")} onClick={() => showTrainingsCost()}><MonetizationOnIcon sx={{marginRight:'10px'}}/>{t("set_trainings_cost")}</MenuItem> : null}
                    {user.role === 'manager' ? <MenuItem onClick={() => openCallForTrainers()} sx={menuStyle("/callfortrainers")}><GroupAddIcon sx={{marginRight:'10px'}}/>{t("call_for_trainers")}</MenuItem> : null}
                    {user.role === 'manager' && (
                    <Box sx={{ width: "100%" }}>

                        <MenuItem onClick={openListOfConfirmedTrainees} sx={menuStyle("/")}>
                            <Badge
                            badgeContent={numberOfConfirmAttendance}
                            color="primary"
                            sx={{
                                "& .MuiBadge-badge": {
                                fontSize: "10px",
                                height: "16px",
                                minWidth: "16px",
                                padding: "2px",
                                position: "absolute",
                                right: "10px",
                                },
                            }}
                            >
                            <ChecklistIcon sx={{ marginRight: '10px' }} />
                            </Badge>
                            {t("new_trainee_confirm")}
                        </MenuItem>
                        
                    </Box>
                    )}
                    {user.role === 'manager' && (
                    <Box sx={{ width: "100%" }}>
                        <MenuItem sx={menuStyle("/")}
                            onClick={() => {
                                handleOpenFeedbackNotification();
                                window.location.href = "/managetrainings";
                            }}
                        >
                            <Badge
                            badgeContent={numberOfNewFeedbacks}
                            color="primary"
                            sx={{
                                "& .MuiBadge-badge": {
                                fontSize: "10px",
                                height: "16px",
                                minWidth: "16px",
                                padding: "2px",
                                position: "absolute",
                                right: "10px",
                                },
                            }}
                            >
                            <FeedbackIcon sx={{ marginRight: '10px' }} />
                            </Badge>
                            {t("new_feedback")}
                        </MenuItem>
                    </Box>
                    )}
                    <MenuItem sx={menuStyle("")} onClick={toggleTheme}  onMouseEnter={handleCloseSubmenu}>
                        {darkMode ? <Brightness7Icon sx={{marginRight:'10px'}}/> : <Brightness4Icon sx={{marginRight:'10px'}}/>}
                        {darkMode? t("light_mode") : t("dark_mode")}
                    </MenuItem>
                    <MenuItem sx={menuStyle("")} onClick={toggleLanguage}  onMouseEnter={handleCloseSubmenu}>
                        <LanguageIcon sx={{marginRight:'10px'}}/>
                        {choosedLanguage === "en" ? t("french") : t("english")}
                    </MenuItem>
                    <MenuItem onClick={() => window.location.href = "/account"} sx={menuStyle("/account")} onMouseEnter={handleCloseSubmenu}><EditIcon sx={{marginRight:'10px'}}/>{t("profile")}</MenuItem>
                    <Tooltip title={t("your_role_updated_to_trainee_trainer")} arrow disableHoverListener={!numberOfRoleChanged}>
                    <MenuItem onClick={handleLogout} sx={menuStyle("/logout")} onMouseEnter={handleCloseSubmenu}>
                        <Badge
                        badgeContent={numberOfRoleChanged}
                        color="primary"
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
                        <LogoutIcon sx={{ marginRight: '10px' }} />
                        </Badge>
                        {t("logout")}
                    </MenuItem>
                    </Tooltip>
                </Menu>
            </Box> : null}
            <Dialog
                open={verifyCallForTrainers}
                disableScrollLock={true}
                onClose={closeCallForTrainers}
                PaperProps={{
                    sx: {
                        minWidth: "55%",  
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
                <DialogTitle>{t("confirm_call_for_trainers")}?</DialogTitle>
                <Box 
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'start',
                            alignItems: 'start',
                            gap: '20px',
                        }}
                    >
                        <Box
                            sx={{
                                width: '40%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'start',
                                alignItems: 'center',
                                gap: '20px',
                            }}
                        >
                            <FormControl component="fieldset"
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "start",
                                    alignItems: "center",
                                }}
                            >
                                <RadioGroup
                                row
                                value={callType}
                                onChange={(e) => setCallType(e.target.value)}
                                >
                                <FormControlLabel
                                    value="all"
                                    control={<Radio />}
                                    label={t("all")}
                                />
                                <FormControlLabel
                                    value="specify"
                                    control={<Radio />}
                                    label={t("specify_trainers")}
                                />
                                </RadioGroup>
                            </FormControl>
                            {callType === "specify" && (
                                <Box sx={{ width: '100%' }}>
                                    <TextField
                                        label={t("search_for_trainer")}
                                        variant="outlined"
                                        fullWidth
                                        sx={{ marginBottom: '20px' }}
                                        value={searchedTrainer}
                                        onChange={(e) => setSearchedTrainer(e.target.value)}
                                    />

                                    {filteredTrainers.map((trainer) => (
                                        <FormControlLabel
                                            key={trainer.id}
                                            control={
                                                <Checkbox
                                                    checked={trainer.selected}
                                                    onChange={() => toggleTrainerSelection(trainer.id)}
                                                />
                                            }
                                            label={trainer.name}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                        <FormControl
                            variant="outlined"
                            sx={{
                                width: '60%',
                            }}
                            >
                            <InputLabel required>{t("message")}</InputLabel>
                            <OutlinedInput
                                multiline
                                minRows={8}
                                value={callMessage}
                                onChange={(e) => setCallMessage(e.target.value)}
                                label={t("message")}
                                sx={{
                                height: '200px',
                                alignItems: 'flex-start'
                                }}
                            />
                        </FormControl>
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
                        onClick={closeCallForTrainers}>
                            {t("no")}
                        </Button>
                        <Button sx={{
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
                        onClick={() => sendCallForTrainers()}>
                            {t("yes")}
                        </Button>
                    </Box>
                </Box>
            </Dialog>
            <Dialog
                open={showListOfConfirmedTrainees}
                disableScrollLock={true}
                onClose={closeListOfConfirmedTrainees}
                PaperProps={{
                    sx: {
                        minWidth: "50%",  
                        height: "auto", 
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "10px",
                        padding: '20px',
                        gap: "10px",
                    }
                }}
            >
                <DialogTitle>{t("trainees_confirmed")}</DialogTitle>
                {[...confirmedTrainees]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((trainee) => (
                    <Box
                    key={trainee._id}
                    sx={{
                        width: "100%",
                        backgroundColor: "background.paper",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: "10px",
                        gap: "10px",
                        padding: "10px",
                    }}
                    >
                    <Typography
                    >{t("name")} : {trainee.name}</Typography>
                    <Typography
                    >{t("email")} : {trainee.email}</Typography>
                    <Typography
                    >{t("training")} : {trainee.trainingTitle}</Typography>
                    {trainee.new ? <Badge color="primary" variant="dot" /> : null}
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
                        closeListOfConfirmedTrainees();
                        }}>
                        {t("ok")}
                    </Button>
                </Box>
            </Dialog>
            <Dialog
                open={becomeTraineeConfirm}
                disableScrollLock={true}
                onClose={closeBecomeTraineeConfirm}
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
                <DialogTitle>{t("become_trainee")}?</DialogTitle>
                <Box 
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                >
                    <FormControl variant="outlined" sx={{ 
                            width: '100%',
                        }}
                    >
                        <InputLabel>{t("message")}</InputLabel>
                        <OutlinedInput
                            multiline
                            required={false}
                            value={becomeTraineeMessage}
                            onChange={(e) => setBecomeTraineeMessage(e.target.value)}
                            label="Message ................"
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
                        onClick={closeBecomeTraineeConfirm}>
                            {t("no")}
                        </Button>
                        <Button sx={{
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
                            handleBecomeTrainee();
                            closeBecomeTraineeConfirm();}}>
                            {t("yes")}
                        </Button>
                    </Box>
                </Box>
            </Dialog>
            <Dialog
                open={showListOfRequests}
                disableScrollLock={true}
                onClose={closeListOfRequests}
                PaperProps={{
                    sx: {
                        minWidth: "70%",  
                        height: "auto", 
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "10px",
                        padding: '20px',
                        gap: "10px",
                    }
                }}
            >
                <DialogTitle>{t("requests")}</DialogTitle>
                {[...listOfRequests]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((trainer) => (
                    <Box
                    key={trainer._id}
                        sx={{
                            width: "100%",
                            backgroundColor: "background.paper",
                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderRadius: "10px",
                            gap: "10px",
                            padding: "10px",
                        }}
                        >
                        <Typography
                        >{t("name")} : {trainer.name}</Typography>
                        <Typography
                        >{t("email")} : {trainer.email}</Typography>
                        <Typography
                        >{t("message")} : {trainer.message}</Typography>
                        <Box 
                            sx={{
                                width: '8%',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'end',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            {trainer.new ? <Badge color="primary" variant="dot" /> : null}
                            <Tooltip title={t("accept")} arrow> 
                                <IconButton sx={{color:"#76C5E1"}} onClick={() => {
                                    handleAddTrainee(trainer._id);
                                    notifyRoleChangeToTrainee(trainer._id);
                                    deleteRequestToBecomeTrainee(trainer._id);
                                }}>
                                    <AddIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("reject")} arrow>
                                <IconButton sx={{color:"#EA9696"}} onClick={() => deleteRequestToBecomeTrainee(trainer._id)}>
                                    <CloseIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>
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
                    onClick={() => {
                        closeListOfRequests();
                        }}>
                        {t("cancel")}
                    </Button>
                    <Button sx={{
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
                        }}>
                        {t("save")}
                    </Button>
                </Box>
            </Dialog>
            <Dialog
                open={trainingsCost}
                disableScrollLock={true}
                onClose={hideTrainingsCost}
                PaperProps={{
                    sx: {
                        minWidth: "15%",  
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
                <DialogTitle>{t("set_new_trainings_cost")}</DialogTitle>
                <Box 
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                >
                <FormControl
                variant="outlined"
                sx={{
                    width: '100%',
                }}
                >
                <InputLabel required>{t("cost")}</InputLabel>
                <OutlinedInput
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    label={t("message")}
                    sx={{
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
                        onClick={hideTrainingsCost}>
                            {t("cancel")}
                        </Button>
                        <Button sx={{
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
                        onClick={() => handleChangeCost()}>
                            {t("save")}
                        </Button>
                    </Box>
                </Box>
            </Dialog>
            <Snackbar open={showsVerificationAlert} autoHideDuration={3000} onClose={handleVerificationAlertClose}>
                <Alert onClose={handleVerificationAlertClose} severity={verifyAlert} variant="filled">
                    {t(verifyAlertMessage)}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Navbar;