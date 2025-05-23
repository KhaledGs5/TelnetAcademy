import React, { useState, useEffect } from "react";
import { useUser } from '../../UserContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Link, Typography,Tooltip,IconButton, Menu, MenuItem, Dialog, Button, DialogTitle, Badge, TableCell,TableRow,TableHead,TableContainer,Paper,TextField
    ,Checkbox,FormControlLabel,TableBody,Table,FormControl, InputLabel,OutlinedInput,InputAdornment, Popover, Snackbar, Alert,Input,
} from "@mui/material";
import { Document, Packer, Paragraph, TextRun, HeadingLevel} from "docx";
import { saveAs } from "file-saver";
import api from "../../api";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import { useNavbar } from '../../NavbarContext';
import io from "socket.io-client";
import { useLanguage } from "../../languagecontext";
import { StaticDatePicker, LocalizationProvider , DateTimePicker} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from 'dayjs';

const TrainerRequest = () => {

    const { t } = useLanguage();

    const location = useLocation();
    const [selectedFormId, setSelectedFormId] = useState("");
    const { user } = useUser();

    // Verify Create Training...........

    const [showsVerificationAlert, setShowsVerifificationAlert] = useState(false);
    const [verifyAlertMessage, setVerifyAlertMessage] = useState("");
    const [verifyAlert, setVerifyAlert] = useState("error");
    const handleVerificationAlertClose = () => {
        setShowsVerifificationAlert(false);
    };

    // Fetch All Forms

    const [forms, setForms] = useState([]);
    const [trainingRequestNotif, setTrainingRequestNotif] = useState([]);

    const fetchForms = async () => {
        api.get("/api/form")
            .then((response) => {
                const updatedForms = response.data
                .filter(form => form.status === "pending" || form.status === "approved")
                .map(form => ({
                    ...form,
                    showDetails: false
                }));
                setForms(updatedForms);
            })
            .catch((error) => {
                console.error("Error fetching forms:", error);
            });
        const response = await api.post("/api/notifications/noread", {rec : user?._id });
        setTrainingRequestNotif(
            response.data.notifications
              .filter(notification => notification.type === "New_Training_Request")
              .map(notification => notification.sender)
          );          
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const getFormById = (id) => {
        return Object.values(forms).find(form => form._id === id) || null;
    };

    const {numberOfTrainingRequests, setNumberOfTrainingRequests} = useNavbar();
    const {numberOfTraineeRequests, setNumberOfTraineeRequests} = useNavbar();

    const handleOpenTrainingRequestNotifications = async (trainerId) => {
        try {
          await api.put("/api/notifications/markread", {rec : user?._id,sen : trainerId,tp : "New_Training_Request", rtp : "readTrainingRequestNotifications"});
          setNumberOfTrainingRequests(0);
        } catch (error) {
          console.error("Error marking notifications as read", error);
        }
    };



     // Adding new Training

    const [trainerInfo, setTrainerInfo] = useState({});

    const [newTrainingTitle, setNewTrainingTitle] = useState("");
    const [newTrainingMonth, setNewTrainingMonth] = useState("");
    const [newTrainingSkillType, setNewTrainingSkillType] = useState("");
    const [newTrainingDate,setNewTrainingDate]= useState("");
    const [newTrainingNbOfHours, setNewTrainingNbOfHours] = useState(0);
    const [newTrainingLocation, setNewTrainingLocation] = useState("");
    const [newTrainingMode, setNewTrainingMode] = useState("");
    const [newTrainingType, setNewTrainingType] = useState("");
    const [newTrainingDescription, setNewTrainingDescription] = useState("");
    const [newTrainingNbOfSessions, setNewTrainingNbOfSessions] = useState(0);
    const [newTrainingNbOfParticipants, setNewTrainingNbOfParticipants ] = useState(0);
    
    
    const [newSessionsNames, setNewSessionsNames] = useState([]);
    const [newSessionsDates, setNewSessionsDates] = useState([]);
    const [newSessionsDurations, setNewSessionsDurations] = useState([]);
    const [newSessionsLocations, setNewSessionsLocations] = useState([]);
    
    const [newTraining, setNewTraining] = useState(false);
    const [otherLocation, setOtherLocation] = useState(false);
    const [otherSessionsLocations, setOtherSessionsLocations] = useState([]);

    const TrainingMonths = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
    ];
    const getMonthDate = (monthName) => {
    const monthIndex = TrainingMonths.indexOf(monthName);
    if (monthIndex === -1) return dayjs(); 
    return dayjs().month(monthIndex).startOf("month");
    };

    const [selectedDays, setSelectedDays] = useState([]);
    const [dateAnchorEl, setDateAnchorEl] = useState(null);

    const handleOpenDatePicker = (event) => {
    setDateAnchorEl(event.currentTarget);
    };

    const handleCloseDatePicker = () => {
    setDateAnchorEl(null);
    };

    const handleDateChange = (newValue) => {
    const selectedDay = newValue.date(); 

    setSelectedDays((prevDays) => {
        let updatedDays;
        if (prevDays.includes(selectedDay)) {
        updatedDays = prevDays.filter((day) => day !== selectedDay);
        } else {
        updatedDays = [...prevDays, selectedDay].sort((a, b) => a - b);
        }

        setNewTrainingDate(updatedDays.join(" "));
        return updatedDays;
    });
    };

    const TrainingSkillTypes = ["soft_skill", "technical_skill"];
    const TrainingModes = ["online", "face_to_face", "hybrid"];
    const TrainingLocations = ['Telnet Sfax', 'Telnet Tunis Lac', 'Telnet Tunis CDS', 'Microsoft Teams'];
    const TrainingTypes = ["internal", "external"];

    const getTrainer = async (formId) => {
        const trainerId = forms.find(form => form._id === formId)?.trainer || "";
        try {
        const response = await api.get(`/api/users/${trainerId}`);
        if (response.status === 200) {
            setTrainerInfo(response.data);
        }
        } catch (error) {
        console.error("Error fetching trainers:", error);
        }
    };  
    
    const showNewTrainingForm = (formId) => {
        setSelectedFormId(formId);
        getTrainer(formId);
        setNewTraining(true);
    };

    const hideNewTrainingForm = () => {
        setNewTraining(false);
    };

    const handleAddTraining = () => {
        const newTraining = {
            title: newTrainingTitle,
            month: newTrainingMonth,
            skillType: newTrainingSkillType,
            date: newTrainingDate,
            nbOfHours: newTrainingNbOfHours,
            location: newTrainingLocation,
            mode: newTrainingMode,
            type: newTrainingType,
            description: newTrainingDescription,
            nbOfSessions: newTrainingNbOfSessions,
            nbOfParticipants: newTrainingNbOfParticipants,
            trainer: trainerInfo._id,
        };
        api.post("/api/trainings", newTraining)
        .then((response) => {
            hideNewTrainingForm();
            addSessions(response.data._id);
            api.put(`/api/form/status/${selectedFormId}`, { status:"approved" })
                .then(() => {fetchForms();});
            if(trainerInfo.role === "trainee"){
                api.put(`/api/users/${trainerInfo._id}`, {role : "trainee_trainer"})
                    .then(() => {
                        api.post("/api/notifications/rolechange", {rec: trainerInfo._id, sen:user?._id,tp:"Role_Changed", msg:"your_role_updated_to_trainee_trainer" })
                        fetchForms();
                        api.post("/role-changed", {
                            toEmail: trainerInfo.email,
                            message: `Hello ${trainerInfo.name}, your role has been updated to Trainee-Trainer.`,
                            url: "http://10.3.1.103:49880/dashboard",
                        });
                    })
            }
            setVerifyAlertMessage("training_added_successfully");
            setVerifyAlert("success");
            setShowsVerifificationAlert(true);
        })
        .catch((error) => {
            console.error("Error adding training:", error);
        });
        
        const addSessions = (trainingId) => {
        const recipients = [trainerInfo.email];
        for (let i = 0; i < newTrainingNbOfSessions; i++) {
            const newSession = {
            name: newSessionsNames[i],
            date: newSessionsDates[i],
            duration: newSessionsDurations[i],
            location: newSessionsLocations[i],
            training: trainingId, 
            };
            const sessionDate = new Date(newSessionsDates[i]); 
            const sessionEnd = new Date(sessionDate.getTime() + newSessionsDurations[i] * 60 * 60 * 1000);
        
            api.post("/api/sessions", newSession)
            .then(() => {
                const eventDetails = {
                    start: sessionDate,
                    end: sessionEnd,
                    summary: newSessionsNames[i] || newTrainingTitle,
                    description: newTrainingDescription || 'Training session',
                    location: newSessionsLocations[i] || newTrainingLocation,
                    url: 'http://10.3.1.103:49880/trainertraining',
                };
                api.post("/send-calendar-event", {
                    recipients,
                    eventDetails
                });
            })
            .catch((error) => {
            });
        }
        };
        api.post("/new_training_status", 
            {
                toEmail: trainerInfo?.email,
                message: `Hello ${trainerInfo?.name}, your training request status has been updated to approved.`,
                url: "http://10.3.1.103:49880/trainertraining",
            })
    };

    // Donwload the form ......

    const [selectFormName, setSelectFormName]= useState(false);
    const [formName, setFormName] = useState("");
    const [selectedForm, setSelectedForm] = useState({});

    const showSelectFormName = (form) => {
        setSelectedForm(form);
        setSelectFormName(true);
    }

    const hideSelectFormName = () => {
        setSelectFormName(false);
    }

    const generateWordDoc = (form) => {
        const sectionTitle = (text) =>
          new Paragraph({
            children: [
              new TextRun({
                text,
                bold: true,
                size: 28, 
                color: "2E86C1", 
              }),
            ],
            spacing: { after: 200 },
          });
      
        const infoLine = (label, value) =>
          new Paragraph({
            children: [
              new TextRun({ text: `${label}: `, bold: true }),
              new TextRun({ text: value || "N/A" }),
            ],
            spacing: { after: 100 },
          });
      
        const doc = new Document({
          sections: [
            {
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Training Form Summary",
                      bold: true,
                      size: 32, 
                      color: "1A5276",
                    }),
                  ],
                  spacing: { after: 400 },
                }),
    
                sectionTitle("General Information"),
                infoLine("Name", form.name),
                infoLine("Matricule", form.matricule),
                infoLine("Position", t(form.position)),
                infoLine("Activity", t(form.activity)),
                infoLine("Date of Hire", form.dateOfHire?.split("T")[0]),
      
                sectionTitle("Domains"),
                ...(form.domains?.length > 0
                  ? form.domains.map((domain, i) =>
                      new Paragraph({
                        children: [
                          new TextRun({ text: `${i + 1}. `, bold: true }),
                          new TextRun({ text: `Description: ${domain.description || "N/A"}    ` }),
                          new TextRun({ text: `Expertise: ${domain.expertise || "N/A"}` }),
                        ],
                        spacing: { after: 100 },
                      })
                    )
                  : [new Paragraph("No domain information provided.")]),
      
                ...(form.hasExperience && Array.isArray(form.exp)
                  ? [
                      sectionTitle("Experience"),
                      ...form.exp.map((exp, i) =>
                        new Paragraph({
                          children: [
                            new TextRun({ text: `${i + 1}. `, bold: true }),
                            new TextRun({ text: `Theme: ${exp.theme || "N/A"}    ` }),
                            new TextRun({ text: `Context: ${exp.cadre || "N/A"}    ` }),
                            new TextRun({ text: `Period: ${exp.periode || "N/A"}` }),
                          ],
                          spacing: { after: 100 },
                        })
                      ),
                    ]
                  : []),

                sectionTitle("Motivation"),
                new Paragraph(form.motivation || "N/A"),
              ],
            },
          ],
        });
      
        Packer.toBlob(doc).then((blob) => {
          saveAs(blob, formName);
        });
        hideSelectFormName();
      };


    // Delete Request
    const [verifyReject, setVerifyReject] = useState(false);

    const showVerifyRejectDialog = (formId) => {
        setSelectedFormId(formId);
        getTrainer(formId);
        setVerifyReject(true);
    };

    const hideVerifyRejectDialog = () => {
        setVerifyReject(false);
    };

    const handleDeleteRequest = async () => {
        const prevstatus = getFormById(selectedFormId)?.status;
        const stat = prevstatus === "pending" ? "rejected" : "deleted"
        await api.put(`/api/form/status/${selectedFormId}`, { status:stat })
        .then(() => {
            hideVerifyRejectDialog();
            setVerifyAlertMessage("training_rejected/deleted");
            setVerifyAlert("success");
            setShowsVerifificationAlert(true);
            fetchForms();
        })
        .catch((error) => {
            console.error("Error deleting form:", error);
        });

        await api.post("/new_training_status", 
            {
                toEmail: trainerInfo?.email,
                message: `Hello ${trainerInfo?.name}, your training request status has been updated to ${stat}.`,
                url: "http://10.3.1.103:49880/trainertraining",
            })
    };

    // Order ........................
    const [orderState, setOrderState] = useState('Down');
    const [selectedOrder, setSelectedOrder] = useState("createdAt");

    const handleChangeOrder = (sel) => {
        setOrderState(orderState === 'Up' ? 'Down' : 'Up');
        setSelectedOrder(sel);
    };

    // Handle Form Changes

    const toggleShowDetails = (formId) => {
        setForms((prevForms) =>
            prevForms.map((form) =>
                form._id === formId ? { ...form, showDetails: !form.showDetails } : form
            )
        );
    };

    const showDetails = (formId) => {
        setForms((prevForms) =>
            prevForms.map((form) =>
                form._id === formId ? { ...form, showDetails: true } : form
            )
        );
    };
    
    // Filters ..............
    const [searchedName, setSearchedName] = useState('');

    const handleSearchChange = (e) => {
        setSearchedName(e.target.value);
    };

    const handleClearSearch = () =>{
        setSearchedName(''); 
    };

    const filteredForms = Object.entries(forms)
    .filter(([_, form]) => form && 
        form.name.toLowerCase().includes(searchedName.toLowerCase())
    )
    .map(([key, form]) => ({ id: key, ...form })); 


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
                        gap: '10px',

                    }}
                >
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
                        onClick={() => handleChangeOrder("Matricule")}
                    >
                        <Typography>
                            {t("registration_number")}
                        </Typography>
                        {selectedOrder === "Matricule" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Button
                        sx={{...orderStyle, width: '16%'}}
                        onClick={() => handleChangeOrder("Fonction")}
                    >
                        <Typography>
                            {t("position")}
                        </Typography>
                        {selectedOrder === "Fonction" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Button
                        sx={{...orderStyle, width: '16%'}}
                        onClick={() => handleChangeOrder("Activity")}
                    >
                        <Typography>
                            {t("activity")}
                        </Typography>
                        {selectedOrder === "Activity" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Button
                        sx={{...orderStyle, width: '16%'}}
                        onClick={() => handleChangeOrder("DateEmbauche")}
                    >
                        <Typography>
                            {t("date_of_hire")}
                        </Typography>
                        {selectedOrder === "DateEmbauche" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                </Box>
                {filteredForms.map((form) => (
                    <Box
                        key={form._id}
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'start',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: "background.paper",
                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                            borderRadius: '10px',
                            cursor: 'pointer',
                            maxHeight: form.showDetails ? '3000px' : '70px', 
                            transition: "all 0.3s ease-in-out",
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'start',
                                alignItems: 'center',
                                gap: '10px',
                                minHeight: '70px',
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
                                {form.name}
                            </Typography>
                            <Typography
                                sx={{
                                    width:"16%",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {form.matricule}
                            </Typography>
                            <Typography
                                sx={{
                                    width:"16%",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {t(form.position)}
                            </Typography>
                            <Typography
                                sx={{
                                    width:"16%",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {t(form.activity)}
                            </Typography>
                            <Typography
                                sx={{
                                    width:"16%",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {dayjs(form.dateOfHire).format('YYYY-MM-DD')}
                            </Typography>
                            <Box sx={{width:'16%', paddingRight: "20px",display:"flex", flexDirection:"row", justifyContent:"end", alignItems: "center"}}>
                                {trainingRequestNotif.includes(form.trainer) ? <Badge color="primary" variant="dot" sx={{marginRight: "10px"}} /> : null}
                                <Tooltip title={t("add_training")} arrow> 
                                    <IconButton sx={{color:"#76C5E1"}} onClick={() => {
                                        showNewTrainingForm(form._id);
                                        showDetails(form._id);
                                    }}>
                                        <AddIcon/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t("delete")} arrow>
                                    <IconButton sx={{color:"#EA9696"}} onClick={() => showVerifyRejectDialog(form._id)}>
                                        <CloseIcon/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t("download")} arrow>
                                    <IconButton sx={{color:"#76C5E1"}} onClick={() => showSelectFormName(form)}>
                                        <DownloadIcon/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={!form.showDetails ? t("view_details") : t("hide_details")} arrow> 
                                    <IconButton sx={{color:"#76C5E1"}} onClick={() => {
                                        toggleShowDetails(form._id);
                                        handleOpenTrainingRequestNotifications(form.trainer);    
                                    }}>
                                        {!form.showDetails ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/>}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                opacity: form.showDetails ? 1 : 0,
                                transition: "all 0.5s ease-in-out",
                                overflow: "hidden",
                                pointerEvents: form.showDetails ? "auto" : "none",
                                width: "100%",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: 'start',
                                alignItems: 'center',
                                gap: "20px",
                            }}
                        >
                            <Box
                                sx={{
                                    overflow: "hidden",
                                    pointerEvents: form.showDetails ? "auto" : "none",
                                    width: newTraining ? "50%" : "100%",
                                    display: "flex",
                                    flexDirection: newTraining ? "column" : "row",
                                    justifyContent: 'start',
                                    alignItems: 'start',
                                    gap: "20px",
                                    padding: "20px",
                                }}
                            >
                                <TableContainer component={Paper} sx={{ width: newTraining ? "100%" : "50%", }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold", fontWeight: "bold" }}>
                                                    {t("domains")}
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold" }}>
                                                    {t("description")}
                                                </TableCell>
                                                <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold" }}>
                                                    {t("references_related_to_expertise")}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {form.domains.map((row, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ width: "10%" }}>
                                                        <Typography>{index + 1}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ width: "45%" }}>
                                                        <Typography>{row.description}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ width: "45%" }}>
                                                        <Typography>{row.expertise}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box
                                    sx={{
                                        width: newTraining ? "100%" : "50%",
                                        display: "flex",
                                        flexDirection: 'column',
                                        justifyContent: 'start',
                                        alignItems: 'start',
                                        gap: "20px",
                                    }}
                                >
                                    {form.hasExperience?
                                    <Box
                                        sx={{ 
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: 'column',
                                            justifyContent: 'start',
                                            alignItems: 'start',
                                            gap: "20px",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: "bold",
                                                color: "button.primary",
                                            }}
                                        >
                                            {t("experience")}
                                        </Typography>
                                        <TableContainer component={Paper}
                                        sx={{ width: "100%" }}
                                        >
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                    <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold" }}>{t("training_theme")}</TableCell>
                                                    <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold" }}>{t("in_what_context")}</TableCell>
                                                    <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold" }}>{t("period")}</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {form.exp.map((row, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell sx={{ width: "30%" }}>
                                                        <Typography>{row.theme}</Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ width: "35%" }}>
                                                        <Typography>{row.cadre}</Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ width: "35%" }}>
                                                        <Typography>{row.periode}</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>:null
                                    } 
                                    <Typography
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: "bold",
                                            color: "button.primary",
                                        }}
                                    >
                                        {t("motivation")}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {form.motivation}
                                    </Typography>
                                </Box>
                            </Box>          
                            <Box
                                sx={{
                                    opacity: newTraining ? 1 : 0,
                                    maxHeight: newTraining ? "3000px" : "0px", 
                                    transition: "all 0.3s ease", 
                                    overflow: "hidden", 
                                    pointerEvents: newTraining ? "auto" : "none", 
                                    width: newTraining ? "50%" : "0px", 
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
                                }}
                            >
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
                                    <FormControl variant="outlined" sx={{ 
                                    width: '50%',
                                    }}
                                    >
                                        <InputLabel required>{t("title")}</InputLabel>
                                        <OutlinedInput
                                            value={newTrainingTitle}
                                            onChange={(e) => setNewTrainingTitle(e.target.value)}
                                            label="Title......."
                                        />
                                    </FormControl>
                                    <TextField
                                        select
                                        label={t("month")}
                                        value={newTrainingMonth}
                                        onChange={(e) => setNewTrainingMonth(e.target.value)}
                                        sx={{
                                            width: '50%',
                                        }}
                                        >
                                        {TrainingMonths.map((month) => (
                                            <MenuItem key={month} value={month}>
                                                {t(month)}
                                            </MenuItem>
                                        ))}
                                    </TextField>
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
                                        select
                                        label={t("skill")}
                                        value={newTrainingSkillType}
                                        onChange={(e) => setNewTrainingSkillType(e.target.value)}
                                        sx={{
                                            width: '50%',
                                        }}
                                        >
                                        {TrainingSkillTypes.map((skillType) => (
                                            <MenuItem key={skillType} value={skillType}>
                                                {t(skillType)}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <FormControl variant="outlined" sx={{ width: "50%" }}>
                                        <InputLabel required>{t("date")}</InputLabel>
                                        <OutlinedInput
                                        readOnly
                                        value={newTrainingDate}
                                        onChange={(e) => setNewTrainingDate(e.target.value)}
                                        label="Date......."
                                        endAdornment={
                                            <InputAdornment position="end">
                                            <IconButton onClick={handleOpenDatePicker} edge="end">
                                                <CalendarTodayIcon />
                                            </IconButton>
                                            </InputAdornment>
                                        }
                                        />
                                    </FormControl>
                                    <Popover
                                        open={Boolean(dateAnchorEl)}
                                        anchorEl={dateAnchorEl}
                                        onClose={handleCloseDatePicker}
                                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                    >
                                        <StaticDatePicker
                                        displayStaticWrapperAs="desktop"
                                        views={["day"]}
                                        minDate={dayjs(getMonthDate(newTrainingMonth)).startOf("month")}
                                        maxDate={dayjs(getMonthDate(newTrainingMonth)).endOf("month")}
                                        onChange={handleDateChange}
                                        sx={{
                                            "& .MuiPickersDay-root": {
                                            backgroundColor: "transparent !important",
                                            "&.Mui-selected": {
                                                backgroundColor: "transparent !important",
                                                color: "inherit",
                                            },
                                            "&:hover": {
                                                backgroundColor: "#f0f0f0 !important",
                                            },
                                            },
                                        }}
                                        />
                                    </Popover>
                                    </LocalizationProvider>
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
                                    <FormControl variant="outlined" 
                                    sx={{ 
                                        width: '50%',
                                    }}
                                    >
                                        <InputLabel required>{t("nbOfHours")}</InputLabel>
                                        <OutlinedInput
                                        type="number"
                                            value={newTrainingNbOfHours}
                                            onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "" || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
                                                setNewTrainingNbOfHours(value);
                                            }
                                            }}
                                            label="Number Of Hours......."
                                        />
                                    </FormControl>
                                    <TextField
                                        select={!otherLocation  && (TrainingLocations.includes(newTrainingLocation) || newTrainingLocation === "")}
                                        label={t("location")}
                                        value={newTrainingLocation}
                                        onChange={(e) => setNewTrainingLocation(e.target.value)}
                                        sx={{
                                            width: '50%',
                                        }}
                                        >
                                        {TrainingLocations.map((location) => (
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
                                                setOtherLocation(true)}
                                        >
                                            {t("other")}...
                                        </Button>
                                    </TextField>
                                    <Dialog
                                        open={otherLocation}
                                        onClose={() => setOtherLocation(false)}
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
                                                value={newTrainingLocation}
                                                onChange={(e) => setNewTrainingLocation(e.target.value)
                                                    }
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
                                                setOtherLocation(false);
                                            }}
                                        >
                                            {t("save")}
                                        </Button>
                                    </Dialog>
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
                                        select
                                        label={t("mode")}
                                        value={newTrainingMode}
                                        onChange={(e) => setNewTrainingMode(e.target.value)}
                                        sx={{
                                            width: '50%',
                                        }}
                                        >
                                        {TrainingModes.map((mode) => (
                                            <MenuItem key={mode} value={mode}>
                                                {t(mode)}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        select
                                        label={t("type")}
                                        value={newTrainingType}
                                        onChange={(e) => setNewTrainingType(e.target.value)}
                                        sx={{
                                            width: '50%',
                                        }}
                                        >
                                        {TrainingTypes.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {t(type)}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: '100%',
                                        gap: '20px',
                                    }}
                                >   
                                    <FormControl variant="outlined" 
                                    sx={{ 
                                        width: '50%',
                                    }}
                                    >
                                        <InputLabel required>{t("nbOfSessions")}</InputLabel>
                                        <OutlinedInput
                                        type="number"
                                            value={newTrainingNbOfSessions}
                                            onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "" || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
                                                setNewTrainingNbOfSessions(value);
                                            };
                                            setOtherSessionsLocations(Array.from({ length: Number(value) }, () => false));
                                            }}
                                            label="Number Of Sessions......."
                                        />
                                    </FormControl>
                                    <FormControl variant="outlined" sx={{ width: '50%' }}>
                                        <InputLabel required shrink={!!trainerInfo?.name}>
                                            {t("trainer")}
                                        </InputLabel>
                                        <OutlinedInput
                                            value={trainerInfo?.name || ""}
                                            label={t("trainer")}
                                            readOnly
                                        />
                                    </FormControl>
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
                                <FormControl variant="outlined" 
                                    sx={{ 
                                    width: '50%',
                                    }}
                                >
                                    <InputLabel required>{t("nbOfParticipants")}</InputLabel>
                                    <OutlinedInput
                                    type="number"
                                    value={newTrainingNbOfParticipants}
                                    onChange={(e) => setNewTrainingNbOfParticipants(e.target.value)}
                                    label="Number Of Participants......."
                                    />
                                </FormControl>
                                <FormControl variant="outlined" 
                                    sx={{ 
                                    width: '50%',
                                    }}
                                >
                                    <InputLabel required>{t("description")}</InputLabel>
                                    <OutlinedInput
                                    multiline
                                    type="text"
                                    value={newTrainingDescription}
                                    onChange={(e) => setNewTrainingDescription(e.target.value)}
                                    label="Description......."
                                    />
                                </FormControl>
                                </Box>
                                <Box 
                                    sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: '100%',
                                    gap: '10px',
                                    flexWrap: "wrap",
                                    
                                }}
                                >
                                    {Array.from({ length: newTrainingNbOfSessions }, (_, index) => (
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
                                                <FormControl variant="outlined" 
                                                sx={{ 
                                                width: '50%',
                                                }}
                                                >
                                                    <InputLabel required>{t("name")}</InputLabel>
                                                    <OutlinedInput
                                                    value={newSessionsNames[index]}
                                                    onChange={(e) =>
                                                        setNewSessionsNames((prevSessions) => {
                                                            const updatedSessions = [...prevSessions]; 
                                                            updatedSessions[index] = e.target.value; 
                                                            return updatedSessions; 
                                                        })
                                                    }
                                                    label="Name......."
                                                    />
                                                </FormControl>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DateTimePicker
                                                    sx={{ 
                                                    width: '50%',
                                                    }}
                                                    disableScrollLock={true}
                                                    shouldDisableDate={(date) => {
                                                    const dayOfMonth = date.date();
                                                    return !selectedDays.includes(dayOfMonth); 
                                                    }}
                                                    minDate={dayjs(getMonthDate(newTrainingMonth)).startOf("month")}
                                                    maxDate={dayjs(getMonthDate(newTrainingMonth)).endOf("month")}
                                                    label={t("date")}
                                                    value={newSessionsDates[index] ? dayjs(newSessionsDates[index]) : null}
                                                    onChange={(dateTime) => {
                                                    if (dateTime) {
                                                        setNewSessionsDates((prevDates) => {
                                                        const updatedDates = [...prevDates];
                                                        updatedDates[index] = dateTime.format("YYYY-MM-DD HH:mm");
                                                        return updatedDates;
                                                        });
                                                    }
                                                    }}
                                                />
                                                </LocalizationProvider>
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
                                                <FormControl variant="outlined" 
                                                sx={{ 
                                                width: '50%',
                                                }}
                                                >
                                                <InputLabel required>{t("duration")}</InputLabel>
                                                <OutlinedInput
                                                    type="number"
                                                    value={newSessionsDurations[index]}
                                                    onChange={(e) =>
                                                        setNewSessionsDurations((prevSessions) => {
                                                            const updatedSessions = [...prevSessions]; 
                                                            updatedSessions[index] = e.target.value; 
                                                            return updatedSessions; 
                                                        })
                                                    }
                                                    label="Duration......."
                                                />
                                                </FormControl>
                                                <TextField
                                                    select={!otherSessionsLocations[index] && (TrainingLocations.includes(newSessionsLocations[index]) || !newSessionsLocations[index])}
                                                    label={t("location")}
                                                    value={newSessionsLocations[index]}
                                                    onChange={(e) => setNewSessionsLocations((prevSessions) => {
                                                        const updatedSessions = [...prevSessions]; 
                                                        updatedSessions[index] = e.target.value; 
                                                        return updatedSessions; 
                                                    })}
                                                    sx={{
                                                        width: '50%',
                                                    }}
                                                    >
                                                    {TrainingLocations.map((location) => (
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
                                                        setOtherSessionsLocations((prevLocations) => {
                                                            const updatedLocations = [...prevLocations];
                                                            updatedLocations[index] = true; 
                                                            return updatedLocations;
                                                        })
                                                    }
                                                >
                                                    {t("other")}...
                                                </Button>
                                                </TextField>
                                                <Dialog
                                                    open={Boolean(otherSessionsLocations[index])}
                                                    onClose={() => 
                                                        setOtherSessionsLocations((prevLocations) => {
                                                            const updatedLocations = [...prevLocations];
                                                            updatedLocations[index] = false; 
                                                            return updatedLocations;
                                                        })
                                                    }
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
                                                    <FormControl variant="outlined" sx={{ width: '200px' }}>
                                                        <InputLabel required>{t("location")}</InputLabel>
                                                        <OutlinedInput
                                                            value={newSessionsLocations[index] || ""} 
                                                            onChange={(e) => setNewSessionsLocations((prevSessions) => {
                                                                const updatedSessions = [...prevSessions]; 
                                                                updatedSessions[index] = e.target.value; 
                                                                return updatedSessions; 
                                                            })}
                                                            label="Activity ................"
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
                                                        onClick={() => 
                                                            setOtherSessionsLocations((prevLocations) => {
                                                                const updatedLocations = [...prevLocations];
                                                                updatedLocations[index] = false; 
                                                                return updatedLocations;
                                                            })
                                                        }
                                                    >
                                                        {t("save")}
                                                    </Button>
                                                </Dialog>
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
                                onClick={hideNewTrainingForm}>
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
                                onClick={handleAddTraining}>
                                    {t("add")}
                                </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                ))}
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
                    <DialogTitle>{t("confirm_delete_request")}?</DialogTitle>
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
                </Dialog>
                <Dialog
                    open={selectFormName}
                    disableScrollLock={true}
                    onClose={hideSelectFormName}
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
                    <DialogTitle>{t("donwload_form")} ?</DialogTitle>
                    <FormControl
                    variant="outlined"
                    sx={{
                        width: '100%',
                    }}
                    >
                    <InputLabel>{t("name")}</InputLabel>
                    <OutlinedInput
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        label={t("name")}
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
                        onClick={hideSelectFormName}>
                            {t("cancel")}
                        </Button>
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
                        onClick={() => generateWordDoc(selectedForm)}
                        >
                            {t("download")}
                        </Button>
                    </Box>
                </Dialog>
            </Box>
            <Snackbar open={showsVerificationAlert} autoHideDuration={3000} onClose={handleVerificationAlertClose}>
                <Alert onClose={handleVerificationAlertClose} severity={verifyAlert} variant="filled">
                    {t(verifyAlertMessage)}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TrainerRequest;