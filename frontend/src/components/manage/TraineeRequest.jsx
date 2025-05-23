import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { Box, Link, Typography,Tooltip,IconButton, MenuItem, Dialog, Button, DialogTitle, TableCell,TableRow,TableHead,TableContainer,Paper,TextField
    ,TableBody,Table,FormControl, InputLabel,OutlinedInput,InputAdornment, Popover, Snackbar, Alert,Input, Badge
} from "@mui/material";
import api from "../../api";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useLanguage } from "../../languagecontext";
import FeedIcon from '@mui/icons-material/Feed';
import PersonIcon from '@mui/icons-material/Person';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { useNavbar } from '../../NavbarContext';
import { useUser } from '../../UserContext';
import dayjs from 'dayjs';

const TraineeRequest = () => {

    const { t } = useLanguage();

    const location = useLocation();
    const [selectedTraineeId, setSelectedTraineeId] = useState("");
    const [selectedTrainingId, setSelectedTrainingId] = useState("");
    const { user } = useUser();

    // Verify ...........

    const [showsVerificationAlert, setShowsVerifificationAlert] = useState(false);
    const [verifyAlertMessage, setVerifyAlertMessage] = useState("");
    const [verifyAlert, setVerifyAlert] = useState("error");
    const handleVerificationAlertClose = () => {
        setShowsVerifificationAlert(false);
    };

    // Fetch All Forms .................

    const [trainings, setTrainings] = useState([]);
    const [traineeRequestNotif, setTraineeRequestNotif] = useState([]);

    const fetchTrainingsWithRequests = async () => {
        api.get("/api/trainings")
            .then((response) => {
                const updatedTrainings = response.data.filter(training => (
                    (training.traineesrequests.length !== 0)
                ));

                Promise.all(
                    updatedTrainings.map(training =>
                        api.get(`/api/sessions/training/${training._id}`)
                            .then((sessionResponse) => {
                                training.sessions = sessionResponse.data;
                                return training;
                            })
                            .catch((error) => {
                                console.error("Error fetching sessions:", error);
                                return training; 
                            })
                    )
                )
                .then((trainingsWithSessions) => {
                    setTrainings(trainingsWithSessions); 
                })
                .catch((error) => {
                    console.error("Error fetching sessions:", error);
                });
            })
            .catch((error) => {
                console.error("Error fetching trainings:", error);
            });
        const response = await api.post("/api/notifications/noread", {rec : user?._id });
        setTraineeRequestNotif(
            response.data.notifications
                .filter(notification => notification.type === "New_Trainee_Request")
                .map(notification => notification.sender)
            );  
    };
    

    useEffect(() => {
        fetchTrainingsWithRequests();
    }, []);

    const {numberOfTrainingRequests} = useNavbar();
    const {numberOfTraineeRequests, setNumberOfTraineeRequests} = useNavbar();


    const handleOpenTraineeRequestNotifications = async (traineeId) => {
        try {
          await api.put("/api/notifications/markread", {rec : user?._id, sen : traineeId, tp : "New_Trainee_Request", rtp : "readTraineeRequestNotifications"});
          setNumberOfTraineeRequests(0);
        } catch (error) {
          console.error("Error marking notifications as read", error);
        }
    };

    // fetch Trainees By Id

    const [traineesData, setTraineesData] = useState({});
    const fetchTrainees = async () => {
        const responses = await Promise.all(
            trainings.flatMap(training => 
                training.traineesrequests.map(t => 
                    api.get(`/api/users/${t.trainee}`).catch(() => null)
                )
            )
        );
    
        const traineesMap = Object.fromEntries(
            responses
                .filter(res => res && res.data)
                .map(res => [res.data._id, res.data])
        );
    
        setTraineesData(traineesMap);
    };
    

    useEffect(() => {
        fetchTrainees();
    }, [trainings]);

    // fetch trainers names .....
    const [trainersData, setTrainersData] = useState([]);

    const fetchTrainers = async () => {
        const responses = await Promise.all(
            trainings.map(training => 
                api.get(`/api/users/${training.trainer}`).catch(() => null)
            )
        );
    
        const trainersMap = Object.fromEntries(
            responses.filter(res => res).map(res => [res.data._id, res.data])
        );
    
        setTrainersData(trainersMap);
    };
    
    
    useEffect(() => {
        fetchTrainers();
    }, [trainings]);
    
    // Show Trainee Details ...............
    const [showTraineeDetails, setShowTraineeDetails] = useState(false);
    
    const handleShowTraineeDetails = (traineeId) => {
        setShowTraineeDetails(true);
        setSelectedTraineeId(traineeId)
    };

    const handleHideTraineeDetails = () => {
        setShowTraineeDetails(false);
    };
        
    
    // show training details by Id............
    const [TrainingTrainers, setTrainingTrainers] = useState([]); 
    const [showTraining, setShowTraining] = useState(false);

    const showTrainingDetails = (trainingId) => {
        setShowTraining(true);
        setSelectedTrainingId(trainingId);
    };

    const hideTrainingDetails = () => {
        setShowTraining(false);
    };

    const getTrainingById = (id) => {
        return Object.values(trainings).find(training => training._id === id) || null;
    };

    // Accept Request
    const [verifyAccept, setVerifyAccept] = useState(false);

    const showVerifyAcceptDialog = (trainingId,traineeId) => {
        setSelectedTraineeId(traineeId);
        setSelectedTrainingId(trainingId)
        setVerifyAccept(true);
    };

    const hideVerifyAcceptDialog = () => {
        setVerifyAccept(false);
    };

    const handleAcceptRequest = async () => {
        await api.put(`/api/trainings/accept/${selectedTrainingId}`, { trainee:selectedTraineeId, manageraccepted : user?._id})
        .then(() => {
            hideVerifyRejectDialog();
            setVerifyAlertMessage("trainee_accepted");
            setVerifyAlert("success");
            setShowsVerifificationAlert(true);
            fetchTrainingsWithRequests();
            hideVerifyAcceptDialog();
        })
        .catch((error) => {
            console.error("Error deleting form:", error);
        });
        await api.post("/accept-request/", 
            {
                toEmail: traineesData[selectedTraineeId]?.email,
                message: `Hello ${traineesData[selectedTraineeId]?.name}, your request has been accepted.`,
                url: "http://10.3.1.103:49880/enrolledtrainee",
            })
    };


    // Reject Request
    const [verifyReject, setVerifyReject] = useState(false);
    const [rejectMessage, setRejectMessage] = useState("");

    const showVerifyRejectDialog = (trainingId,traineeId) => {
        setSelectedTraineeId(traineeId);
        setSelectedTrainingId(trainingId)
        setVerifyReject(true);
    };

    const hideVerifyRejectDialog = () => {
        setVerifyReject(false);
    };

    const handleDeleteRequest = () => {
        api.put(`/api/trainings/reject/${selectedTrainingId}`, { trainee:selectedTraineeId, managerrejected:user?._id })
        .then(() => {
            hideVerifyRejectDialog();
            setVerifyAlertMessage("trainee_rejected");
            setVerifyAlert("success");
            setShowsVerifificationAlert(true);
            fetchTrainingsWithRequests();
            hideVerifyRejectDialog();
        })
        .catch((error) => {
            console.error("Error deleting form:", error);
        });
        api.get(`/api/users/${selectedTraineeId}`)
            .then((response) => {
                const receiver = {
                    toEmail: response.data.email,
                    message: rejectMessage,
                    url: "http://10.3.1.103:49880/enrolledtrainee",
                }
                api.post("/reject-request", receiver);
            })
    };

    // Order ........................
    const [orderState, setOrderState] = useState('Down');
    const [selectedOrder, setSelectedOrder] = useState("createdAt");

    const handleChangeOrder = (sel) => {
        setOrderState(orderState === 'Up' ? 'Down' : 'Up');
        setSelectedOrder(sel);
    };

    // Filters ................
    const [searchedName, setSearchedName] = useState('');
    const [selectedTitle, setSelectedTitle] = useState('all');

    const handleSearchChange = (e) => {
        setSearchedName(e.target.value);
    };

    const handleClearSearch = () =>{
        setSearchedName(''); 
    };

    const filteredTrainings = Object.entries(trainings || {})
    .filter(([_, training]) => training !== undefined) 
    .map(([key, training]) => {
        const filteredTraineesRequests = (training.traineesrequests || []).filter(req => 
            traineesData?.[req.trainee]?.name?.toLowerCase().includes(searchedName.toLowerCase())
        );

        return { id: key, ...training, traineesrequests: filteredTraineesRequests };
    })
    .filter(training => 
        (selectedTitle === 'all' || training._id === selectedTitle) &&
        (searchedName === '' || training.traineesrequests.length > 0)
    );




    // Styles .........

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

    const orderStyle = {
        color: "text.primary",
        textTransform: "none",
    };


    return (
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
                    width: '40%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    marginTop: '20px',
                }}  
            >
                <Badge badgeContent={numberOfTrainingRequests} color="primary"
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
                    href="/requests/trainer"
                    sx={linkStyle("/requests/trainer")}
                    >
                        {t("trainer_requests")}
                    </Link>
                </Badge>
                <Badge badgeContent={numberOfTraineeRequests} color="primary"
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
                href="/requests/trainee"
                sx={linkStyle("/requests/trainee")}
                >
                    {t("trainee_requests")}
                </Link>
                </Badge>
            </Box>
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
                    padding: '30px',
                    gap: "10px",
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <Input
                        placeholder={t("search_by_name")}
                        value={searchedName}
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
                            searchedName && (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClearSearch} size="small">
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    >
                    </Input>
                    <TextField
                        select
                        label={t("training")}
                        value={selectedTitle}
                        onChange={(e) => setSelectedTitle(e.target.value)}
                        sx={{ width: '20%' }}
                    >
                        <MenuItem key="all" value="all">
                            {t("All")}
                        </MenuItem>

                        {trainings.map((training) => (
                            <MenuItem key={training._id} value={training._id}>
                                {training.title} 
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
                    <Button
                        sx={{...orderStyle, width: '16%'}}
                        onClick={() => handleChangeOrder("Tilte")}
                    >
                        <Typography>
                            {t("title")}
                        </Typography>
                        {selectedOrder === "Tilte" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Button
                        sx={{...orderStyle, width: '16%'}}
                        onClick={() => handleChangeOrder("Name")}
                    >
                        <Typography>
                            {t("name")}
                        </Typography>
                        {selectedOrder === "Name" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Button
                        sx={{...orderStyle, width: '16%'}}
                        onClick={() => handleChangeOrder("Email")}
                    >
                        <Typography>
                            {t("email")}
                        </Typography>
                        {selectedOrder === "Email" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Button
                        sx={{...orderStyle, width: '16%'}}
                        onClick={() => handleChangeOrder("Trainer")}
                    >
                        <Typography>
                            {t("trainer")}
                        </Typography>
                        {selectedOrder === "Trainer " ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Button
                        sx={{...orderStyle, width: '16%'}}
                        onClick={() => handleChangeOrder("dateOfRegistration")}
                    >
                        <Typography>
                            {t("date_of_registration")}
                        </Typography>
                        {selectedOrder === "dateOfRegistration" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                </Box>
                <Box
                    sx={{
                        width: '100%',
                        height: 'auto',
                        boxSizing: 'border-box',
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "start",
                        gap: "10px",
                    }}
                >
                    {filteredTrainings.map(training => (
                        training.traineesrequests.map(req => (
                            <Box key={req.trainee} 
                                sx={{
                                    width: '100%',
                                    height: '70px',
                                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                                    borderRadius: '10px',
                                    display: 'flex',
                                    justifyContent: "start",
                                    alignItems: 'center',
                                    gap: '5px',
                                    paddingTop: '10px',
                                    paddingBottom: '10px',
                                }}
                            >
                                <Typography
                                    sx={{
                                        width:"16%",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {training.title}
                                </Typography>
                                <Typography
                                    sx={{
                                        width:"16%",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {traineesData[req.trainee]?.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        width:"16%",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {traineesData[req.trainee]?.email}
                                </Typography>
                                <Typography
                                    sx={{
                                        width:"16%",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {trainersData[training.trainer]?.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        width:"16%",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {dayjs(req.date).format('YYYY-MM-DD HH:mm')}
                                </Typography>
                                <Box sx={{width:'18%', paddingRight: "10px",display:"flex", flexDirection:"row", justifyContent:"end", alignItems: "center"}}>
                                    {traineeRequestNotif.includes(req.trainee) ? <Badge color="primary" variant="dot" sx={{marginRight: "10px"}} /> : null}
                                    <Tooltip title={t("view_trainee_details")} arrow> 
                                        <IconButton sx={{ color: "#76C5E1" }} onClick={() => {
                                            handleShowTraineeDetails(req.trainee);
                                            handleOpenTraineeRequestNotifications(req.trainee);
                                            }}>
                                            <PersonIcon /> 
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t("view_training_details")} arrow> 
                                        <IconButton sx={{ color: "#76C5E1" }} onClick={() => {
                                            showTrainingDetails(training._id)
                                            handleOpenTraineeRequestNotifications(req.trainee);
                                        }}>
                                            <FeedIcon /> 
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t("accept")} arrow> 
                                        <IconButton sx={{ color: "#76C5E1" }} onClick={() => { 
                                            showVerifyAcceptDialog(training._id, req.trainee);
                                            handleOpenTraineeRequestNotifications(req.trainee);
                                        }}>
                                            <AddIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t("reject")} arrow>
                                        <IconButton sx={{ color: "#EA9696" }} onClick={() => {
                                            showVerifyRejectDialog(training._id, req.trainee);
                                            handleOpenTraineeRequestNotifications(req.trainee);
                                        }}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        ))
                    ))}
                </Box>
            </Box>
            <Dialog
                open={verifyReject}
                disableScrollLock={true}
                onClose={hideVerifyRejectDialog}
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
                <DialogTitle>{t("confirm_reject_request")}?</DialogTitle>
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
                        <InputLabel required>{t("message")}</InputLabel>
                        <OutlinedInput
                            multiline
                            value={rejectMessage}
                            onChange={(e) => setRejectMessage(e.target.value)}
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
                        onClick={hideVerifyRejectDialog}>
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
                        onClick={handleDeleteRequest}
                        >
                            {t("yes")}
                        </Button>
                    </Box>
                </Box>
            </Dialog>
            <Dialog
                open={verifyAccept}
                disableScrollLock={true}
                onClose={hideVerifyAcceptDialog}
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
                <DialogTitle>{t("confirm_accept_request")}?</DialogTitle>
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
                    onClick={hideVerifyAcceptDialog}>
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
                    onClick={handleAcceptRequest}
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
                        pointerEvents: "none", 
                        userSelect: "text",    
                        cursor: "default",
                        width: '100%',
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
                open={showTraineeDetails}
                disableScrollLock={true}
                onClose={handleHideTraineeDetails}
                PaperProps={{
                    sx: {
                        width: "400px",  
                        height: "auto", 
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "start",
                        alignItems: "center",
                        borderRadius: "10px",
                        gap: "10px",
                        padding: "20px",
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        fontSize: 25,
                        fontWeight: "bold",
                        textAlign: "center",
                        letterSpacing: 0.2,
                        lineHeight: 1,
                        userSelect: "none",
                        color: "#2CA8D5",
                    }}
                >{t("trainee_details")}</DialogTitle>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("name")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{traineesData[selectedTraineeId]?.name}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("email")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{traineesData[selectedTraineeId]?.email}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("gender")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{t(traineesData[selectedTraineeId]?.gender)}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("activity")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{traineesData[selectedTraineeId]?.activity}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("jobtitle")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{traineesData[selectedTraineeId]?.jobtitle}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("grade")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{traineesData[selectedTraineeId]?.grade}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("role")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{t(traineesData[selectedTraineeId]?.role)}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">N+1 :</Typography>
                    <Typography variant="body2" color="text.secondary">{t(traineesData[selectedTraineeId]?.chef)}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("type")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{t(traineesData[selectedTraineeId]?.type)}</Typography>
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
export default TraineeRequest;