import React, {useState} from "react";
import { Box, TextField , Typography, Button ,IconButton, Tooltip} from "@mui/material";
import { useLanguage } from "../../languagecontext";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from '@mui/icons-material/Save';
import { setCookie, getCookie } from "../Cookies";

const AdminSettings = () => {
    const { t } = useLanguage();

    const [image, setImage] = useState(getCookie("ProfileImage"));
    const [nameChanged, setNameChanged] = useState(false);
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [oldPasswordVerified, setOldPasswordVerified] = useState(false);

    const handleImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const imageURL = URL.createObjectURL(file);
        setImage(imageURL);
        setCookie("ProfileImage", imageURL, 20);
      }
    };

    const handleNameChange = () => {
        setNameChanged(true)
    };

    const handlePasswordChange = () => {
        if(oldPasswordVerified){
            setPasswordChanged(true);
        }
    };

    const handleVerifyOldPassword = (e) => {
        if(e.target.value === "old password"){
            setOldPasswordVerified(true);
        }
    };

    const handleSavedChanges = (tp) => {
        if(tp === "Name"){
            setNameChanged(false);
        }else if (tp === "Password"){
            setPasswordChanged(false);
        }
    };

    const buttonStyle = {
        color: 'white',
        backgroundColor: '#2CA8D5',
        padding: '5px 10px',
        borderRadius: '10px',
        textDecoration: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '75%',
        height: '35%',
        fontWeight: 'bold',
        textAlign: "center",
    };

    return (
        <Box
            sx={{
                width: '60%',
                height: '70vh',
                boxSizing: 'border-box',
                backgroundColor: "background.paper",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "start",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                borderRadius: '10px',
                position: "absolute",
                left: '20%',
                top: '20%',
            }}
        >
            <Box
                sx={{
                    width: '90%',
                    height: '30%',
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "start",
                    justifyContent: "start",
                    borderRadius: '10px',
                    position: "absolute",
                    top: '10%',
                    paddingLeft: '20px',
                }}
            >
                <Box    
                    sx={{
                        width: '150px',
                        height: '150px',
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                        borderRadius: '50%',
                        cursor: "pointer",
                        position: "relative"
                    }}
                >
                {!image ? (
                    <Button variant="contained" component="label" sx={buttonStyle}>
                        {t("add_photo")}
                        <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </Button>
                ) : (
                    <>
                        <img 
                            src={image} 
                            alt="Preview" 
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "50%",
                            }}
                        />
                        <IconButton
                            component="label"
                            sx={{
                                position: "absolute",
                                bottom: 5,
                                right: 5,
                                backgroundColor: "rgba(0,0,0,0.6)",
                                color: "white",
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" }
                            }}
                        >
                            <EditIcon />
                            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </IconButton>
                    </>
                )}
                </Box>
                <Box 
                    sx={{
                        width: '300px',
                        height: '150px',
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                        justifyContent: "center",
                        paddingLeft: '20px',
                    }}
                >
                    <Typography variant="body1">Khaled Gassara</Typography>
                    <Typography variant="caption" color="text.secondary">{t("admin")}</Typography>
                </Box>
            </Box>
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
                    position: "absolute",
                    top: '40%',
                }}
            >
                {t("edit_account")}
            </Typography>
            <Box
                sx={{
                    width: '60%',
                    height: '60px',
                    display: 'flex',
                    justifyContent: "start",
                    alignItems: 'center',
                    gap: '20px',
                    position: 'absolute',
                    top: '55%',

                }}
            >
                <Typography variant="body1">Khaled Gassara</Typography>
                <TextField label={t("new_name")} variant="outlined" required onChange={handleNameChange}/>
                <Tooltip title={t("save")} arrow> 
                    <IconButton sx={{color:"#76C5E1"}} disabled={!nameChanged} onClick={() => handleSavedChanges("Name")}>
                        <SaveIcon/>
                    </IconButton>
                </Tooltip>
            </Box>
            <Box
                sx={{
                    width: '60%',
                    height: '60px',
                    display: 'flex',
                    justifyContent: "start",
                    alignItems: 'center',
                    gap: '20px',
                    position: 'absolute',
                    top: '70%',

                }}
            >
                <TextField label={t("old_password")} variant="outlined" required onChange={handleVerifyOldPassword}/>
                <TextField label={t("new_password")} variant="outlined" required onChange={handlePasswordChange}/>
                <Tooltip title={t("save")} arrow> 
                    <IconButton sx={{color:"#76C5E1"}} disabled={!passwordChanged} onClick={() => handleSavedChanges("Password")}>
                        <SaveIcon/>
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default AdminSettings;