import React, { useState, useEffect } from "react";
import { getCookie , setCookie} from './Cookies';
import { Box, Link, Typography, Menu, MenuItem, Dialog, Button, DialogTitle, Badge, TableCell,TableRow,TableHead,TableContainer,Paper,TextField
    ,Checkbox,FormControlLabel,TableBody,Table
} from "@mui/material";
import axios from 'axios';
import io from "socket.io-client";
import { useLanguage } from "../languagecontext";

const TrainerCalls = () => {

    const { t } = useLanguage();
    const user = getCookie("User") ?? null;
    const [showForm, setShowForm] = useState(false);
    const [availableCall, setAvailableCall] = useState(false);

    // fetch available call
    const [callMessage, setCallMessage] = useState("");

    const fetchAvailableCalls = () => {
        axios.get(`http://localhost:5000/api/users/availablenotif/${user._id}`)
            .then((res) => {
                console.log(res.data);
                if(res.data.notifications.length > 0){
                    setAvailableCall(true);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    };
    const getCallMessage = () => {
        axios.get(`http://localhost:5000/api/users/availablenotif/${user._id}`)
           .then((res) => {
                setCallMessage(res.data.notifications[res.data.notifications.length -1].message);
            })
           .catch((err) => {
                console.error(err);
                setCallMessage("No new notifications");
            });
    }
    useEffect(() => {
        getCallMessage();
        fetchAvailableCalls();
    }, []);

    // Form ...........
    const [formData, setFormData] = useState({
        matricule: "",
        name: "",
        fonction: "",
        activite: "",
        dateEmbauche: "",
        domains: Array(4).fill({ description: "", expertise: "" }),
        hasExperience: false,
        exp: Array(2).fill({ theme: "", cadre: "", periode:""}),
        motivation: "",
        trainer: user._id,
    });
    
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
            epx: prev.exp.map((ex, i) =>
                i === index ? { ...ex, [key]: value } : ex
            ),
        }));
    };

    const handleRespondCall = () => {
        axios.delete(`http://localhost:5000/api/users/callnotif/${user._id}`)
           .then(() => {
                setShowForm(false);
            })
        axios.post("http://localhost:5000/api/form", formData)
           .then((response) => {
              console.log(response.data);
           })
           .catch((error) => {
              console.error("Error sending form data:", error);
           });
        
    };

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
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
                  {t("hello")} {user.name},<br /> {availableCall ? callMessage
                  : t("telnet_academy_is_not_calling_for_training_sessions")}
                </Typography>    
                {availableCall ? 
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
                </Box>
                :null}
            </Box>
            {availableCall ? 
            <Box
            sx={{
                width: '50%',
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
                value={formData.matricule} 
                onChange={(e) => handleChange("matricule", e.target.value)} 
                />
                <TextField label={t("name_and_lastname")} variant="outlined" 
                value={formData.name} 
                onChange={(e) => handleChange("name", e.target.value)} 
                />
                <TextField label={t("position")} variant="outlined" 
                value={formData.fonction} 
                onChange={(e) => handleChange("fonction", e.target.value)} 
                />
                <TextField label={t("activity_department")} variant="outlined" 
                value={formData.activite} 
                onChange={(e) => handleChange("activite", e.target.value)} 
                />
                <TextField label={t("date_of_hire")} type="date" variant="outlined" 
                InputLabelProps={{ shrink: true }} 
                value={formData.dateEmbauche} 
                onChange={(e) => handleChange("dateEmbauche", e.target.value)} 
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
                onClick={() => handleRespondCall()}
                >
                    {t("send")}
                </Button>
            </Box>
            </Box>
            :null}
        </Box>
    );
}

export default TrainerCalls;