import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography,Tooltip,IconButton, Button, TableCell,TableRow,TableHead,TableContainer,Paper,TextField
    ,Checkbox,FormControlLabel,TableBody,Table,Snackbar, Alert,OutlinedInput,InputLabel,FormControl,MenuItem,Dialog
} from "@mui/material";
import { useLanguage } from "../languagecontext";
import api from "../api";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavbar } from '../NavbarContext';
import dayjs from 'dayjs';
import TrainerCalls from "./TrainerCalls";
import { useUser } from '../UserContext';

const TrainerTraining = () => {

    const { user } = useUser();
    const { t } = useLanguage();

    const [showForm, setShowForm] = useState(false);

    // Verify Sending Form...........

    const [showsVerificationAlert, setShowsVerifificationAlert] = useState(false);
    const [verifyAlertMessage, setVerifyAlertMessage] = useState("");
    const [verifyAlert, setVerifyAlert] = useState("error");
    const handleVerificationAlertClose = () => {
        setShowsVerifificationAlert(false);
    };

    // fetch all forms

    const [forms, setForms] = useState([]);
    const [numberOfPending, setNumberOfPending] = useState(0);
    const [numberOfApproved, setNumberOfApproved] = useState(0);
    const [numberOfRejected, setNumberOfRejected] = useState(0);

    const fetchForms = () => {
        api.get(`/api/form/${user?._id}`)
            .then((response) => {
                console.log(response.data);
                const updatedForms = response.data.map(form => ({
                    ...form,
                    showDetails: false
                }));
                let pendingCount = 0;
                let approvedCount = 0;
                let rejectedCount = 0;
                updatedForms.forEach(form => {
                    if (form.status === "pending") pendingCount++;
                    if (form.status === "approved" || form.status === "deleted") approvedCount++;
                    if (form.status === "rejected") rejectedCount++;
                });
                setNumberOfPending(pendingCount);
                setNumberOfApproved(approvedCount);
                setNumberOfRejected(rejectedCount);
                setForms(updatedForms);
                handleOpenTrainingsStatusNotifications();
            })
            .catch((error) => {
                console.error("Error fetching forms:", error);
            });
    };

    const {setNumberOfTrainingsStatus} = useNavbar();

    const handleOpenTrainingsStatusNotifications = async () => {
        try {
        await api.delete("/api/notifications", {
            data: {
                rec: user?._id,
                tp: "New_Training_Status",
            }
            });
          setNumberOfTrainingsStatus(0);
        } catch (error) {
          console.error("Error marking notifications as read", error);
        }
    };
    
    useEffect(() => {
        fetchForms();
    }, []);



    // Form ...........
    const [formData, setFormData] = useState({
        matricule: "",
        name: user?.name,
        position: user?.jobtitle,
        activity: user?.activity,
        dateOfHire: "",
        domains: Array(4).fill({ description: "", expertise: "" }),
        hasExperience: false,
        exp: Array(2).fill({ theme: "", cadre: "", periode:""}),
        motivation: "",
        trainer: user?._id,
    });

    const UserActivities = ["enablers", "mechanical", "formation_systems", "databox", "telecom", "quality", "e-paysys", "media&energy", "electronics", "space"];
    const [otherActivity, setOtherActivity]= useState(false);
    const UserJobTitles = ["associate_engineer","engineer","team_leader","technical_leader","senior_team_leader","senior_technical_leader","project_manager",
    "consulting_manager","senior_project_manager","expert","program_manager","senior_expert","senior_program_manager","architect","program_director",
    "senior_architect"
    ];
    const [otherJobTitle, setOtherJobTitle] = useState(false);
    
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };
    
    const handleDomainChange = (index, key, value) => {
        setFormData((prev) => ({
            ...prev,
            domains: prev.domains.map((domain, i) =>
                i === index ? { ...domain, [key]: value } : domain
            ),
        }));
    };

    const handleExpChange = (index, key, value) => {
        setFormData((prev) => ({
            ...prev,
            exp: prev.exp.map((ex, i) =>
                i === index ? { ...ex, [key]: value } : ex
            ),
        }));
    };

    const handleSendForm = () => {
        api.post("/api/form", formData)
           .then((response) => {
                setShowsVerifificationAlert(true);
                setVerifyAlertMessage(t("form_submitted_successfully"));
                setVerifyAlert("success");
                setShowForm(false);
                fetchForms();
                setShowsVerifificationAlert(true);
                setVerifyAlertMessage(t("form_submitted_successfully"));
                setVerifyAlert("success");
           })
           .catch((error) => {
                console.error("Error sending form data:", error);
                setShowsVerifificationAlert(true);
                setVerifyAlertMessage(t("form_submission_failed"));
                setVerifyAlert("error");
           });  
    };

    //Filters ...............
    const FormStatusColors = {
        "pending": '#90CAF9',
        "approved": '#A5D6A7',
        "deleted": '#A5D6A7',
        "rejected":'#FFCDD2',
    }

    const [selectedFilter, setSelectedFilter] = useState("all");

    const filteredForms = Object.entries(forms)
        .filter(([key, form]) => 
            selectedFilter === "all" || form.status === selectedFilter
        )
        .map(([key, form]) => form); 

    // Handle Form Changes

    const toggleShowDetails = (formId) => {
        setForms((prevForms) =>
            prevForms.map((form) =>
                form._id === formId ? { ...form, showDetails: !form.showDetails } : form
            )
        );
    };

    //Styles ..............
    
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


    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'start',
                alignItems: 'start',
                padding: "20px",
            }}
        >
            <Box
                sx={{
                    width: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: "20px",
                    paddingRight: "20px",
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '20px',
                        backgroundColor: 'background.paper',
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                        borderRadius: '10px',
                        marginBottom: "20px",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 20,
                            fontWeight: "bold",
                            textAlign: "center",
                            letterSpacing: 0.2,
                            lineHeight: 1.5,
                            userSelect: "none",
                            cursor: "pointer",
                            color: "text.primary",
                            width: "100%",
                        }}
                    >
                    {t("hello")} {user?.name},<br /> {t("if_you_have_any_training_suggestion_you_can_fill_the_form_now")}
                    </Typography>    
                    <Box
                    sx={{
                        width: "100%",
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '20px',
                    }}
                    >
                        {showForm?
                        <Button
                            sx={{
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
                            onClick={() => setShowForm(false)}
                        >
                            {t("cancel")}
                        </Button>
                        :null}
                        <Tooltip title={t("add_form")} arrow>   
                            <Button
                                sx={{
                                    color: 'white',
                                    backgroundColor: '#2CA8D5',
                                    padding: '5px 10px',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    width: '150px',
                                    height: '40px',
                                    marginTop: '10px',
                                    textTransform: "none",
                                    '&:hover': {
                                        backgroundColor: '#76C5E1',
                                        color: 'white',
                                    },
                                }} 
                                onClick={() => setShowForm(true)}
                            >
                                {t("add_suggestion")}
                            </Button>
                        </Tooltip>
                    </Box>
                </Box> 
                <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '20px',
                    backgroundColor: 'background.paper',
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                    borderRadius: '10px',
                    height: showForm ? 'auto' : 0, 
                    opacity: showForm ? 1 : 0, 
                    visibility: showForm ? 'visible' : 'hidden', 
                    overflow: 'hidden', 
                    transition: 'height 0.3s ease, opacity 0.3s ease', 
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
                    color: "black",
                    marginLeft: 5,
                }}>
                    {t("application_form")}
                </Typography>
                <Typography
                sx={{
                    fontSize: 26,
                    fontWeight: "bold",
                    textAlign: "center",
                    letterSpacing: 0.2,
                    lineHeight: 1,
                    userSelect: "none",
                    cursor: "pointer",
                    color: "#2CA8D5",
                    marginLeft: 5,
                    marginBottom: "30px",
                }}>
                    {t("trainer_referent_telnet_academy")}
                </Typography>
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {t("candidate_information")}
                    </Typography>
                    <TextField  label={t("registration_number")} variant="outlined" 
                    required
                    value={formData.matricule} 
                    onChange={(e) => handleChange("matricule", e.target.value)} 
                    />
                    <TextField label={t("name_and_lastname")} variant="outlined" 
                    required
                    value={formData.name} 
                    onChange={(e) => handleChange("name", e.target.value)} 
                    />
                    <TextField
                        select={!otherJobTitle  && (UserJobTitles.includes(formData.position) || formData.position === "")}
                        required
                        label={t("position")}
                        value={formData.position} 
                        onChange={(e) => handleChange("position", e.target.value)} 
                        sx={{
                            width: '100%',
                        }}
                    >
                        {UserJobTitles.map((jobtitle) => (
                            <MenuItem key={jobtitle} value={jobtitle}>
                                {t(jobtitle)}
                            </MenuItem>
                        ))}
                        <Button 
                            sx={{
                                width: "100%",
                                textTransform: "none",
                                color: "black",
                            }}
                            onClick={() => setOtherJobTitle(true)}
                        >
                            {t("other")}...
                        </Button>
                    </TextField>
                    <Dialog
                        open={otherJobTitle}
                        onClose={() => setOtherJobTitle(false)}
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
                            <InputLabel required>{t("position")}</InputLabel>
                            <OutlinedInput
                                value={formData.position} 
                                onChange={(e) => handleChange("position", e.target.value)} 
                                label="position  ................"
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
                                setOtherJobTitle(false);
                            }}
                        >
                            {t("save")}
                        </Button>
                    </Dialog>
                    <TextField
                        select={!otherActivity  && (UserActivities.includes(formData.activity) || formData.activity === "")}
                        required
                        label={t("activity")}
                        value={formData.activity}
                        onChange={(e) => handleChange("activity", e.target.value)} 
                        sx={{
                            width: '100%',
                        }}
                    >
                        {UserActivities.map((activity) => (
                            <MenuItem key={activity} value={activity}>
                                {t(activity)}
                            </MenuItem>
                        ))}
                        <Button 
                            sx={{
                                width: "100%",
                                textTransform: "none",
                                color: "black",
                            }}
                            onClick={() => setOtherActivity(true)}
                        >
                            {t("other")}...
                        </Button>
                    </TextField>
                    <Dialog
                        open={otherActivity}
                        onClose={() => setOtherActivity(false)}
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
                            <InputLabel required>{t("activity")}</InputLabel>
                            <OutlinedInput
                                value={formData.activity}
                                onChange={(e) => handleChange("activity", e.target.value)} 
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
                                setOtherActivity(false);
                            }}
                        >
                            {t("save")}
                        </Button>
                    </Dialog>
                    <TextField label={t("date_of_hire")} type="date" variant="outlined" 
                    required
                    InputLabelProps={{ shrink: true }} 
                    value={formData.dateOfHire} 
                    onChange={(e) => handleChange("dateOfHire", e.target.value)} 
                    />
                </Box>
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {t("domains_and_specialties_you_wish_to_work_in")}
                    </Typography>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold" }}>{t("domains")}</TableCell>
                                <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold" }}>{t("description")}</TableCell>
                                <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold" }}>{t("references_related_to_expertise")}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formData.domains.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{width :"10%"}}>
                                        <Typography>{index+1}</Typography>
                                    </TableCell>
                                    <TableCell sx={{width :"45%"}}>
                                    <TextField value={row.description} 
                                    multiline
                                        onChange={(e) => handleDomainChange(index, "description", e.target.value)}
                                        sx={{width :"100%"}} />
                                    </TableCell>
                                    <TableCell sx={{width :"45%"}}>
                                    <TextField value={row.expertise} 
                                    multiline
                                        onChange={(e) => handleDomainChange(index, "expertise", e.target.value)} 
                                        sx={{width :"100%"}}/>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {t("do_you_have_previous_experience_as_a_trainer")}
                    </Typography>
                    <Box sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        height: '100%',
                        gap: '10px',
                    }}>
                        <FormControlLabel 
                            control={<Checkbox checked={formData.hasExperience} 
                            onChange={(e) => handleChange("hasExperience", e.target.checked)} />} 
                            label={t("yes")}
                        />
                        <FormControlLabel 
                            control={<Checkbox checked={!formData.hasExperience} 
                            onChange={(e) => handleChange("hasExperience", !e.target.checked)} />} 
                            label={t("no")}
                        />
                    </Box>
                </Box>
                {formData.hasExperience ? 
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold" }}>{t("training_theme")}</TableCell>
                                <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold" }}>{t("in_what_context")}</TableCell>
                                <TableCell sx={{ backgroundColor: "button.primary", color: "white", fontWeight: "bold" }}>{t("period")}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formData.exp.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                    <TextField value={row.expertise} 
                                    multiline
                                        onChange={(e) => handleExpChange(index, "theme", e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                    <TextField value={row.description}
                                        multiline 
                                        onChange={(e) => handleExpChange(index, "cadre", e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                    <TextField value={row.expertise} 
                                        multiline
                                        onChange={(e) => handleExpChange(index, "periode", e.target.value)} />
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>:null}
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                        {t("what_are_your_motivations_for_becoming_a_reference_trainer")}
                    </Typography>
                    <TextField value={formData.motivation}
                        multiline 
                        onChange={(e) => handleChange("motivation", e.target.value)} 
                        sx={{width :"100%"}}/>
                </Box>
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: '20px',
                }}>
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
                    onClick={() => setShowForm(false)}
                    >
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
                    onClick={() => handleSendForm()}
                    >
                        {t("send")}
                    </Button>
                </Box>
                </Box>
                <Typography
                    sx={{
                        fontSize: 20,
                        fontWeight: "bold",
                        textAlign: "center",
                        letterSpacing: 0.2,
                        lineHeight: 1.5,
                        userSelect: "none",
                        cursor: "pointer",
                        color: "text.primary",
                        width: "100%",
                        marginBottom: "10px",
                        marginTop: "20px",
                    }}
                >
                {t("list_of_training_calls")}
                </Typography> 
                <TrainerCalls w="100%" p="0px"/>
            </Box>
            <Box
                sx={{
                    width: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'start',
                    alignItems: 'start',
                    padding: "20px",
                    backgroundColor: 'background.paper',
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                    borderRadius: '10px',
                    marginTop: '20px',
                }}
            >

                <Typography
                    sx={{
                        fontSize: 20,
                        fontWeight: "bold",
                        textAlign: "center",
                        letterSpacing: 0.2,
                        lineHeight: 1.5,
                        userSelect: "none",
                        cursor: "pointer",
                        color: "text.primary",
                        width: "100%",
                    }}
                >
                    {t("list_of_trainings_requests")}
                </Typography>
                <Box
                    sx={{
                        width:"100%",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "start",
                        gap: "10px",
                        marginTop: "20px",
                        marginBottom: "10px"
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '10px',
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
                    </Box>
                </Box>
                <Box
                    sx={{
                        width:"100%",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "start",
                        gap: "10px",
                    }}
                >
                    {filteredForms.map((form, index) => (
                        <Box
                            key={form._id}
                            sx={{
                                width:"100%",
                                backgroundColor: "background.paper",
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "start",
                                alignItems: "start",
                                borderRadius: "10px",
                                gap: "10px",
                                padding: "10px",
                                maxHeight: form.showDetails ? '2000px' : '60px',
                                transition: "all 0.3s ease-in-out",
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    height: "50px",
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'start',
                                    alignItems: 'center',
                                    gap: '20px',
                                    paddingLeft: "10px",
                                }}
                            >
                                <Typography
                                    sx={{
                                        width:"40%",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'start',
                                    }}
                                >
                                  {t("Training") } : {form.domains[0].description}
                                </Typography>
                                <Typography
                                    sx={{
                                        width:"40%",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'start',
                                    }}
                                >
                                  {t("sent_date")}: {dayjs(form.createdAt).format('YYYY-MM-DD HH:mm')}
                                </Typography>
                                <Box
                                    sx={{
                                        marginRight: '10px',
                                        width: "20px",
                                        height: "20px", 
                                        backgroundColor: FormStatusColors[form?.status],
                                        borderRadius: "50%",
                                    }}
                                />
                                <Box sx={{width:'10%', paddingRight: "20px",display:"flex", flexDirection:"row", justifyContent:"end"}}>
                                    <Tooltip title={!form.showDetails ? t("view_details") : t("hide_details")} arrow> 
                                        <IconButton sx={{color:"#76C5E1"}} onClick={() => toggleShowDetails(form._id)}>
                                            {!form.showDetails ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/>}
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    opacity: form.showDetails ? 1 : 0,
                                    transition: "all 0.2s ease-in-out",
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
                                <TableContainer component={Paper} sx={{ }}>
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
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
            <Snackbar open={showsVerificationAlert} autoHideDuration={3000} onClose={handleVerificationAlertClose}>
                <Alert onClose={handleVerificationAlertClose} severity={verifyAlert} variant="filled">
                    {t(verifyAlertMessage)}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default TrainerTraining;