import React, { useState, useEffect } from "react";
import { getCookie , setCookie} from './Cookies';
import { Box, Link, Typography, Menu, MenuItem, Dialog, Button, DialogTitle, Badge, TableCell,TableRow,TableHead,TableContainer,Paper,TextField
    ,Checkbox,FormControlLabel,TableBody,Table,Snackbar, Alert,OutlinedInput,InputLabel,FormControl
} from "@mui/material";
import api from "../api";
import { useLanguage } from "../languagecontext";
import { useUser } from '../UserContext';

const TrainerCalls = ({ w="70%", p="20px"}) => {

    const { t } = useLanguage();
    const { user } = useUser();

    // Verify Sending Form...........

    const [showsVerificationAlert, setShowsVerifificationAlert] = useState(false);
    const [verifyAlertMessage, setVerifyAlertMessage] = useState("");
    const [verifyAlert, setVerifyAlert] = useState("error");
    const handleVerificationAlertClose = () => {
        setShowsVerifificationAlert(false);
    };

    // fetch available call
    const [calls, setCalls] = useState([]); 

    const fetchAvailableCalls = async () => {
      try {
        const res = await api.post("/api/notifications/withtype", {
          rec: user?._id,
          tp: "Call_For_Trainers"
        });
    
        const notificationsWithFlag = res.data.notifications.map(n => ({
          ...n,
          showForm: false
        }));
    
        setCalls(notificationsWithFlag);
      } catch (err) {
        console.error(err);
      }
    };
    
    useEffect(() => {
      fetchAvailableCalls();
    }, []);
    
    console.log(calls);

    const handleCallsChange = (value, id, topic) => {
        setCalls((prevCalls) =>
          prevCalls.map((call) =>
            call._id === id
              ? { ...call, [topic]: value }
              : call
          )
        );
      };      

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
        console.log(formData);
    };

    const handleRespondCall = async (notifId) => {
        try {
          await api.post("/api/form", {
            ...formData,
            notifId,
          }).then(() => {
            fetchAvailableCalls();
          })
          setShowsVerifificationAlert(true);
          setVerifyAlertMessage(t("form_submitted_successfully"));
          setVerifyAlert("success");
        } catch (error) {
          console.error("Error sending form data:", error);
          setShowsVerifificationAlert(true);
          setVerifyAlertMessage(t("form_submission_failed"));
          setVerifyAlert("error");
        }
      };
      

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding:p,
            }}
        >
            {calls.map((call) => (
                <Box
                    key={call._id}
                    sx={{
                        width: "100%",
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap:"15px"
                    }}
                >
                    <Box
                        sx={{
                            width: w,
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
                        {t("hello")} {user?.name},<br /> {call.message}
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
                            onClick={() => handleCallsChange(false,call._id,"showForm")}
                            >
                                {t("cancel")}
                            </Button>
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
                            onClick={() => handleCallsChange(true,call._id,"showForm")}
                            >
                                {t("submit_form")}
                            </Button>
                        </Box>
                    </Box>
                    <Box
                    sx={{
                        width: w,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '20px',
                        backgroundColor: 'background.paper',
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                        borderRadius: '10px',
                        height:  call.showForm ? 'auto' : 0 , 
                        opacity:  call.showForm ? 1 : 0, 
                        visibility: call.showForm ? 'visible' : 'hidden', 
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
                        onClick={() => handleCallsChange(false,call._id,"showForm")}
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
                        onClick={() => handleRespondCall(call._id)}
                        >
                            {t("send")}
                        </Button>
                    </Box>
                    </Box>
                </Box>
            ))}
            {calls.length === 0 && (
            <Box
                sx={{
                mt: 3,
                p: 2,
                textAlign: 'center',
                color: 'text.secondary',
                border: '1px dashed',
                borderColor: 'grey.300',
                borderRadius: 2,
                backgroundColor: 'background.paper',
                }}
            >
                <Typography>
                {t("telnet_academy_is_not_calling_for_training_sessions")}
                </Typography>
            </Box>
            )}
            <Snackbar open={showsVerificationAlert} autoHideDuration={3000} onClose={handleVerificationAlertClose}>
                <Alert onClose={handleVerificationAlertClose} severity={verifyAlert} variant="filled">
                    {t(verifyAlertMessage)}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default TrainerCalls;